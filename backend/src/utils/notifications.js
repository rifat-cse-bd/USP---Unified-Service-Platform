import { query } from '../config/database.js';

/**
 * Emit Socket.io event to a user's room and persist notification row.
 */
export async function notifyUser(io, userId, { type, title, body, data = null }) {
  await query(
    `INSERT INTO notifications (user_id, type, title, body, data) VALUES (?, ?, ?, ?, ?)`,
    [userId, type, title, body, data ? JSON.stringify(data) : null]
  );
  const rows = await query(
    `SELECT id, user_id, type, title, body, data, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
    [userId]
  );
  const n = rows[0];
  io.to(`user:${userId}`).emit('notification', n);
  return n;
}

export async function emitBookingUpdate(io, booking) {
  const payload = { booking };
  io.to(`user:${booking.customer_id}`).emit('booking:update', payload);
  const rows = await query(`SELECT user_id FROM workers WHERE id = ?`, [booking.worker_id]);
  const workerUserId = rows[0]?.user_id;
  if (workerUserId) {
    io.to(`user:${workerUserId}`).emit('booking:update', payload);
  }
}
