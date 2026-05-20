import { body, param } from 'express-validator';
import { query, queryOne, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const workerValidators = {
  updateProfile: [
    body('headline').optional().trim(),
    body('bio').optional().trim(),
    body('hourly_rate').optional().isFloat({ min: 0 }),
    body('service_radius_km').optional().isInt({ min: 1 }),
    body('years_experience').optional().isInt({ min: 0, max: 80 }),
    body('availability').optional(),
  ],
  document: [
    body('doc_type').optional().isIn(['nid', 'passport', 'license', 'certificate', 'other']),
  ],
};

export const getMyWorker = asyncHandler(async (req, res) => {
  const worker = await queryOne(
    `SELECT w.*, u.full_name, u.email, u.phone, u.avatar_url, u.city
     FROM workers w JOIN users u ON u.id = w.user_id WHERE u.id = ?`,
    [req.user.id]
  );
  if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });
  res.json({ success: true, worker });
});

export const updateMyWorker = asyncHandler(async (req, res) => {
  const worker = await queryOne(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
  if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });
  const { headline, bio, hourly_rate, service_radius_km, years_experience, availability } = req.body;
  const updates = [];
  const params = [];
  const map = { headline, bio, hourly_rate, service_radius_km, years_experience };
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) {
      updates.push(`${k} = ?`);
      params.push(v);
    }
  }
  if (availability !== undefined) {
    updates.push('availability = ?');
    params.push(JSON.stringify(availability));
  }
  if (updates.length) {
    params.push(worker.id);
    await run(`UPDATE workers SET ${updates.join(', ')} WHERE id = ?`, params);
  }
  const updated = await queryOne(
    `SELECT w.*, u.full_name, u.email, u.phone, u.avatar_url FROM workers w JOIN users u ON u.id = w.user_id WHERE w.id = ?`,
    [worker.id]
  );
  res.json({ success: true, worker: updated });
});

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'File required' });
  const worker = await queryOne(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
  if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });
  const doc_type = req.body.doc_type || 'nid';
  const base = process.env.API_PUBLIC_URL || 'http://localhost:5000';
  let fileUrl = `${base.replace(/\/$/, '')}/uploads/${req.file.filename}`;
  try {
    const { uploadFileToCloudinary, isCloudinaryEnabled } = await import('../config/cloudinary.js');
    if (isCloudinaryEnabled()) {
      const remote = await uploadFileToCloudinary(req.file.path, 'worksure/docs');
      if (remote) fileUrl = remote;
    }
  } catch (e) {
    console.warn('Cloudinary upload failed, using local URL', e.message);
  }
  await run(
    `INSERT INTO worker_documents (worker_id, doc_type, file_url, status) VALUES (?, ?, ?, 'pending')`,
    [worker.id, doc_type, fileUrl]
  );
  res.status(201).json({ success: true, message: 'Document submitted for review' });
});

export const myEarnings = asyncHandler(async (req, res) => {
  const worker = await queryOne(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
  if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });
  const paid = await queryOne(
    `SELECT COALESCE(SUM(COALESCE(p.worker_payout, p.amount)),0) AS total,
            COALESCE(SUM(p.platform_commission),0) AS platform_fees
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     WHERE b.worker_id = ? AND p.status = 'completed'`,
    [worker.id]
  );
  const monthly = await query(
    `SELECT DATE_FORMAT(p.created_at, '%Y-%m') AS month,
            SUM(COALESCE(p.worker_payout, p.amount)) AS total
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     WHERE b.worker_id = ? AND p.status = 'completed' GROUP BY month ORDER BY month DESC LIMIT 12`,
    [worker.id]
  );
  res.json({
    success: true,
    total: Number(paid.total),
    platform_fees: Number(paid.platform_fees),
    monthly,
  });
});

export const listMyDocuments = asyncHandler(async (req, res) => {
  const worker = await queryOne(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
  if (!worker) return res.status(404).json({ success: false, message: 'Worker profile not found' });
  const rows = await query(`SELECT * FROM worker_documents WHERE worker_id = ? ORDER BY id DESC`, [worker.id]);
  res.json({ success: true, documents: rows });
});

export const listWorkersPublic = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const offset = (page - 1) * limit;
  const city = req.query.city ? `%${req.query.city}%` : null;
  const minRating = req.query.minRating != null ? Number(req.query.minRating) : null;
  const verifiedOnly = req.query.verified === '1' || req.query.verified === 'true';
  const search = req.query.q ? `%${req.query.q}%` : null;
  const category = req.query.category || null;
  const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : null;

  let where = `WHERE u.is_banned = 0`;
  const params = [];
  if (city) {
    where += ` AND u.city LIKE ?`;
    params.push(city);
  }
  if (minRating != null && !Number.isNaN(minRating)) {
    where += ` AND w.rating_avg >= ?`;
    params.push(minRating);
  }
  if (verifiedOnly) where += ` AND w.is_verified = 1`;
  if (search) {
    where += ` AND (u.full_name LIKE ? OR w.headline LIKE ?)`;
    params.push(search, search);
  }
  if (category) {
    where += ` AND EXISTS (
      SELECT 1 FROM services sv JOIN categories c ON c.id = sv.category_id
      WHERE sv.worker_id = w.id AND sv.is_active = 1 AND (c.slug = ? OR c.id = ?)
    )`;
    params.push(category, Number(category) || -1);
  }
  if (maxPrice != null && !Number.isNaN(maxPrice)) {
    where += ` AND w.hourly_rate <= ?`;
    params.push(maxPrice);
  }

  const countRows = await query(
    `SELECT COUNT(*) AS total FROM workers w JOIN users u ON u.id = w.user_id ${where}`,
    params
  );
  const total = countRows[0]?.total || 0;

  const rows = await query(
    `SELECT w.id, w.headline, w.bio, w.hourly_rate, w.rating_avg, w.rating_count, w.is_verified, w.years_experience,
            u.id AS user_id, u.full_name, u.city, u.avatar_url
     FROM workers w
     JOIN users u ON u.id = w.user_id
     ${where}
     ORDER BY w.is_verified DESC, w.rating_avg DESC, w.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

export const getWorkerPublic = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const worker = await queryOne(
    `SELECT w.*, u.full_name, u.city, u.avatar_url, u.created_at AS member_since
     FROM workers w JOIN users u ON u.id = w.user_id WHERE w.id = ? AND u.is_banned = 0`,
    [id]
  );
  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
  const services = await query(
    `SELECT s.*, c.name AS category_name, c.slug AS category_slug
     FROM services s JOIN categories c ON c.id = s.category_id
     WHERE s.worker_id = ? AND s.is_active = 1`,
    [id]
  );
  const reviews = await query(
    `SELECT r.*, u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar
     FROM reviews r JOIN users u ON u.id = r.reviewer_id
     WHERE r.worker_id = ? ORDER BY r.id DESC LIMIT 20`,
    [id]
  );
  res.json({ success: true, worker, services, reviews });
});

export const publicValidators = [param('id').isInt()];
