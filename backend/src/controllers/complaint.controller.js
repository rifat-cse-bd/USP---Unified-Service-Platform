import { body } from 'express-validator';
import { query, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const complaintValidators = {
  create: [
    body('subject').trim().notEmpty(),
    body('message').trim().notEmpty(),
    body('subject_user_id').optional().isInt(),
    body('booking_id').optional().isInt(),
  ],
};

export const createComplaint = asyncHandler(async (req, res) => {
  const { subject, message, subject_user_id, booking_id } = req.body;
  const r = await run(
    `INSERT INTO complaints (reporter_id, subject_user_id, booking_id, subject, message) VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, subject_user_id || null, booking_id || null, subject, message]
  );
  res.status(201).json({ success: true, id: r.insertId });
});

export const myComplaints = asyncHandler(async (req, res) => {
  const rows = await query(`SELECT * FROM complaints WHERE reporter_id = ? ORDER BY id DESC`, [req.user.id]);
  res.json({ success: true, data: rows });
});
