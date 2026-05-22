import { body, param } from 'express-validator';
import { query, queryOne, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveCategoryIds, categoryFilterSql } from '../utils/categories.js';

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 200);
}

export const serviceValidators = {
  create: [
    body('category_id').isInt(),
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('base_price').isFloat({ min: 0 }),
    body('duration_minutes').optional().isInt({ min: 15 }),
  ],
  update: [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('base_price').optional().isFloat({ min: 0 }),
    body('duration_minutes').optional().isInt({ min: 15 }),
    body('is_active').optional().isBoolean(),
  ],
};

export const listCategories = asyncHandler(async (_req, res) => {
  const rows = await query(
    `SELECT id, parent_id, name, slug, icon, description, image_url, sort_order
     FROM categories ORDER BY sort_order, name`
  );
  const majors = rows
    .filter((c) => !c.parent_id)
    .map((major) => ({
      ...major,
      subfeatures: rows.filter((c) => c.parent_id === major.id),
    }));
  res.json({ success: true, majors, categories: rows });
});

export const listServices = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const offset = (page - 1) * limit;
  const category = req.query.category;
  const minPrice = req.query.minPrice != null ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : null;
  const q = req.query.q ? `%${req.query.q}%` : null;
  const city = req.query.city ? `%${req.query.city}%` : null;
  const minRating = req.query.minRating != null ? Number(req.query.minRating) : null;
  const verifiedOnly = req.query.verified === '1' || req.query.verified === 'true';

  let where = `WHERE s.is_active = 1 AND u.is_banned = 0`;
  const params = [];
  if (category) {
    const categoryIds = await resolveCategoryIds(category);
    if (categoryIds?.length) {
      const { clause, params: catParams } = categoryFilterSql(categoryIds, 'c');
      where += clause;
      params.push(...catParams);
    } else {
      where += ` AND 1 = 0`;
    }
  }
  if (minPrice != null && !Number.isNaN(minPrice)) {
    where += ` AND s.base_price >= ?`;
    params.push(minPrice);
  }
  if (maxPrice != null && !Number.isNaN(maxPrice)) {
    where += ` AND s.base_price <= ?`;
    params.push(maxPrice);
  }
  if (q) {
    where += ` AND (s.title LIKE ? OR s.description LIKE ? OR s.tags LIKE ?)`;
    params.push(q, q, q);
  }
  if (city) {
    where += ` AND u.city LIKE ?`;
    params.push(city);
  }
  if (minRating != null && !Number.isNaN(minRating)) {
    where += ` AND w.rating_avg >= ?`;
    params.push(minRating);
  }
  if (verifiedOnly) {
    where += ` AND w.is_verified = 1`;
  }

  const countRows = await query(
    `SELECT COUNT(*) AS total FROM services s
     JOIN workers w ON w.id = s.worker_id
     JOIN users u ON u.id = w.user_id
     JOIN categories c ON c.id = s.category_id
     ${where}`,
    params
  );
  const total = countRows[0]?.total || 0;

  const rows = await query(
    `SELECT s.*, c.name AS category_name, c.slug AS category_slug,
            w.id AS worker_table_id, w.rating_avg AS worker_rating, w.is_verified,
            u.full_name AS worker_name, u.city AS worker_city, u.avatar_url AS worker_avatar
     FROM services s
     JOIN workers w ON w.id = s.worker_id
     JOIN users u ON u.id = w.user_id
     JOIN categories c ON c.id = s.category_id
     ${where}
     ORDER BY w.is_verified DESC, w.rating_avg DESC, s.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

export const getService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const row = await queryOne(
    `SELECT s.*, c.name AS category_name, c.slug AS category_slug,
            w.id AS worker_id, w.headline AS worker_headline, w.rating_avg, w.is_verified, w.hourly_rate,
            u.full_name AS worker_name, u.city AS worker_city, u.avatar_url AS worker_avatar, u.id AS worker_user_id
     FROM services s
     JOIN workers w ON w.id = s.worker_id
     JOIN users u ON u.id = w.user_id
     JOIN categories c ON c.id = s.category_id
     WHERE s.id = ? AND s.is_active = 1`,
    [id]
  );
  if (!row) return res.status(404).json({ success: false, message: 'Service not found' });
  res.json({ success: true, service: row });
});

export const createService = asyncHandler(async (req, res) => {
  const worker = await queryOne(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
  if (!worker) return res.status(403).json({ success: false, message: 'Worker account required' });
  const { category_id, title, description, base_price, duration_minutes = 60, tags } = req.body;
  let slug = slugify(`${title}-${worker.id}-${Date.now()}`);
  const images = req.body.images ? JSON.stringify(req.body.images) : null;
  const r = await run(
    `INSERT INTO services (worker_id, category_id, title, slug, description, base_price, duration_minutes, images, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [worker.id, category_id, title, slug, description, base_price, duration_minutes, images, tags || null]
  );
  const created = await queryOne(`SELECT * FROM services WHERE id = ?`, [r.insertId]);
  res.status(201).json({ success: true, service: created });
});

export const updateService = asyncHandler(async (req, res) => {
  const worker = await queryOne(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
  if (!worker) return res.status(403).json({ success: false, message: 'Worker account required' });
  const svc = await queryOne(`SELECT * FROM services WHERE id = ? AND worker_id = ?`, [req.params.id, worker.id]);
  if (!svc) return res.status(404).json({ success: false, message: 'Service not found' });
  const fields = ['title', 'description', 'base_price', 'duration_minutes', 'is_active', 'tags'];
  const updates = [];
  const params = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      params.push(f === 'is_active' ? (req.body[f] ? 1 : 0) : req.body[f]);
    }
  }
  if (req.body.images !== undefined) {
    updates.push('images = ?');
    params.push(JSON.stringify(req.body.images));
  }
  if (updates.length) {
    params.push(svc.id);
    await run(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`, params);
  }
  const updated = await queryOne(`SELECT * FROM services WHERE id = ?`, [svc.id]);
  res.json({ success: true, service: updated });
});

export const uploadServiceImages = asyncHandler(async (req, res) => {
  const worker = await queryOne(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
  if (!worker) return res.status(403).json({ success: false, message: 'Worker account required' });
  const svc = await queryOne(`SELECT * FROM services WHERE id = ? AND worker_id = ?`, [req.params.id, worker.id]);
  if (!svc) return res.status(404).json({ success: false, message: 'Service not found' });
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ success: false, message: 'No files' });
  let images = [];
  try {
    images = typeof svc.images === 'string' ? JSON.parse(svc.images) : svc.images;
  } catch {
    images = [];
  }
  if (!Array.isArray(images)) images = [];
  const { uploadFileToCloudinary, isCloudinaryEnabled } = await import('../config/cloudinary.js');
  for (const f of files) {
    let url = `${process.env.API_PUBLIC_URL || ''}/uploads/${f.filename}`;
    if (isCloudinaryEnabled()) {
      const remote = await uploadFileToCloudinary(f.path, 'worksure/services');
      if (remote) url = remote;
    }
    images.push(url);
  }
  await run(`UPDATE services SET images = ? WHERE id = ?`, [JSON.stringify(images), svc.id]);
  const updated = await queryOne(`SELECT * FROM services WHERE id = ?`, [svc.id]);
  res.json({ success: true, service: updated });
});

export const deleteService = asyncHandler(async (req, res) => {
  const worker = await queryOne(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
  if (!worker) return res.status(403).json({ success: false, message: 'Worker account required' });
  await run(`DELETE FROM services WHERE id = ? AND worker_id = ?`, [req.params.id, worker.id]);
  res.json({ success: true });
});

export const searchSuggestions = asyncHandler(async (req, res) => {
  const term = req.query.q ? String(req.query.q).trim() : '';
  if (term.length < 2) return res.json({ success: true, suggestions: [] });
  const like = `%${term}%`;
  const rows = await query(
    `SELECT DISTINCT s.title, c.name AS category FROM services s
     JOIN categories c ON c.id = s.category_id
     WHERE s.is_active = 1 AND (s.title LIKE ? OR c.name LIKE ?) LIMIT 8`,
    [like, like]
  );
  res.json({ success: true, suggestions: rows });
});

export const recommendations = asyncHandler(async (req, res) => {
  let categoryIds = [];
  if (req.user) {
    const hist = await query(
      `SELECT DISTINCT s.category_id FROM bookings b
       JOIN services s ON s.id = b.service_id
       WHERE b.customer_id = ? ORDER BY b.id DESC LIMIT 5`,
      [req.user.id]
    );
    categoryIds = hist.map((h) => h.category_id).filter(Boolean);
  }
  let sql = `SELECT s.*, c.name AS category_name, w.rating_avg, u.full_name AS worker_name
     FROM services s
     JOIN categories c ON c.id = s.category_id
     JOIN workers w ON w.id = s.worker_id
     JOIN users u ON u.id = w.user_id
     WHERE s.is_active = 1 AND u.is_banned = 0`;
  const params = [];
  if (categoryIds.length) {
    sql += ` ORDER BY FIELD(s.category_id, ${categoryIds.map(() => '?').join(',')}) DESC, w.rating_avg DESC, RAND() LIMIT 8`;
    params.push(...categoryIds);
  } else {
    sql += ` ORDER BY w.rating_avg DESC, RAND() LIMIT 8`;
  }
  const trending = await query(sql, params);
  res.json({ success: true, data: trending, note: 'Heuristic mock — replace with ML ranker in production.' });
});

export const idParam = [param('id').isInt()];
