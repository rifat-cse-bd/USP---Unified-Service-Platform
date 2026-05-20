import { body, param } from 'express-validator';
import { query, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const wishValidators = {
  add: [body('service_id').isInt()],
};

export const listWishlist = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT w.created_at, s.*, c.name AS category_name, u.full_name AS worker_name
     FROM wishlist w
     JOIN services s ON s.id = w.service_id
     JOIN categories c ON c.id = s.category_id
     JOIN workers wr ON wr.id = s.worker_id
     JOIN users u ON u.id = wr.user_id
     WHERE w.user_id = ? ORDER BY w.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, items: rows });
});

export const addWishlist = asyncHandler(async (req, res) => {
  const { service_id } = req.body;
  await run(
    `INSERT IGNORE INTO wishlist (user_id, service_id) VALUES (?, ?)`,
    [req.user.id, service_id]
  );
  res.status(201).json({ success: true });
});

export const removeWishlist = asyncHandler(async (req, res) => {
  await run(`DELETE FROM wishlist WHERE user_id = ? AND service_id = ?`, [req.user.id, req.params.serviceId]);
  res.json({ success: true });
});

export const serviceIdParam = [param('serviceId').isInt()];
