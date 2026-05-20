import { body, param } from 'express-validator';
import { query, queryOne, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const chatValidators = {
  send: [body('content').trim().notEmpty().isLength({ max: 4000 })],
};

export const listMessages = asyncHandler(async (req, res) => {
  const booking = await queryOne(
    `SELECT b.*, w.user_id AS worker_user_id FROM bookings b JOIN workers w ON w.id = b.worker_id WHERE b.id = ?`,
    [req.params.bookingId]
  );
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  const isCustomer = booking.customer_id === req.user.id;
  const isWorker = booking.worker_user_id === req.user.id;
  if (!isCustomer && !isWorker && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const messages = await query(
    `SELECT m.*, u.full_name AS sender_name, u.avatar_url AS sender_avatar
     FROM messages m JOIN users u ON u.id = m.sender_id
     WHERE m.booking_id = ? ORDER BY m.id ASC`,
    [req.params.bookingId]
  );
  res.json({ success: true, messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const booking = await queryOne(
    `SELECT b.*, w.user_id AS worker_user_id FROM bookings b JOIN workers w ON w.id = b.worker_id WHERE b.id = ?`,
    [req.params.bookingId]
  );
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  const isCustomer = booking.customer_id === req.user.id;
  const isWorker = booking.worker_user_id === req.user.id;
  if (!isCustomer && !isWorker) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const r = await run(
    `INSERT INTO messages (booking_id, sender_id, content) VALUES (?, ?, ?)`,
    [req.params.bookingId, req.user.id, req.body.content]
  );
  const msg = await queryOne(
    `SELECT m.*, u.full_name AS sender_name FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.id = ?`,
    [r.insertId]
  );
  const io = req.app.get('io');
  io.to(`booking:${req.params.bookingId}`).emit('chat:message', msg);
  const recipient = isCustomer ? booking.worker_user_id : booking.customer_id;
  io.to(`user:${recipient}`).emit('chat:message', msg);
  res.status(201).json({ success: true, message: msg });
});

export const bookingIdParam = [param('bookingId').isInt()];
