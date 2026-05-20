import { body } from 'express-validator';
import { query, queryOne, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const profileValidators = [
  body('full_name').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('country').optional().trim(),
  body('latitude').optional().isFloat(),
  body('longitude').optional().isFloat(),
];

export const getProfile = asyncHandler(async (req, res) => {
  const user = await queryOne(
    `SELECT id, email, role, full_name, phone, avatar_url, address, city, country, latitude, longitude, created_at FROM users WHERE id = ?`,
    [req.user.id]
  );
  res.json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const fields = ['full_name', 'phone', 'address', 'city', 'country', 'latitude', 'longitude'];
  const updates = [];
  const params = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      params.push(req.body[f]);
    }
  }
  if (!updates.length) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }
  params.push(req.user.id);
  await run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
  const user = await queryOne(
    `SELECT id, email, role, full_name, phone, avatar_url, address, city, country, latitude, longitude FROM users WHERE id = ?`,
    [req.user.id]
  );
  res.json({ success: true, user });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File required' });
  }
  const url = `${process.env.API_PUBLIC_URL || ''}/uploads/${req.file.filename}`;
  await run(`UPDATE users SET avatar_url = ? WHERE id = ?`, [url, req.user.id]);
  res.json({ success: true, avatar_url: url });
});
