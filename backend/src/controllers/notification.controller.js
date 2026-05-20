import { query, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 100`,
    [req.user.id]
  );
  res.json({ success: true, notifications: rows });
});

export const markRead = asyncHandler(async (req, res) => {
  await run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id]);
  res.json({ success: true });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await run(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`, [req.user.id]);
  res.json({ success: true });
});
