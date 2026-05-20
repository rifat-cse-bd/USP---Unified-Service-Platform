import { body, param } from 'express-validator';
import { query, queryOne, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reviewValidators = {
  create: [
    body('booking_id').isInt(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim(),
  ],
};

export const createReview = asyncHandler(async (req, res) => {
  const { booking_id, rating, comment } = req.body;
  const booking = await queryOne(
    `SELECT b.*, w.id AS worker_pk FROM bookings b JOIN workers w ON w.id = b.worker_id WHERE b.id = ?`,
    [booking_id]
  );
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.customer_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Only customer can review' });
  }
  if (booking.status !== 'completed') {
    return res.status(400).json({ success: false, message: 'Complete the booking before reviewing' });
  }
  const dup = await queryOne(`SELECT id FROM reviews WHERE booking_id = ?`, [booking_id]);
  if (dup) return res.status(409).json({ success: false, message: 'Already reviewed' });

  await run(
    `INSERT INTO reviews (booking_id, reviewer_id, worker_id, rating, comment) VALUES (?, ?, ?, ?, ?)`,
    [booking_id, req.user.id, booking.worker_pk, rating, comment || null]
  );

  const agg = await queryOne(
    `SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE worker_id = ?`,
    [booking.worker_pk]
  );
  await run(`UPDATE workers SET rating_avg = ?, rating_count = ? WHERE id = ?`, [
    Number(agg.avg_rating).toFixed(2),
    agg.cnt,
    booking.worker_pk,
  ]);

  const review = await queryOne(`SELECT * FROM reviews WHERE booking_id = ?`, [booking_id]);
  res.status(201).json({ success: true, review });
});

export const listGivenByMe = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT r.*, s.title AS service_title FROM reviews r
     JOIN bookings b ON b.id = r.booking_id
     JOIN services s ON s.id = b.service_id
     WHERE r.reviewer_id = ? ORDER BY r.id DESC`,
    [req.user.id]
  );
  res.json({ success: true, reviews: rows });
});

export const listForWorker = asyncHandler(async (req, res) => {
  const worker = await queryOne(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
  const rows = await query(
    `SELECT r.*, u.full_name AS reviewer_name FROM reviews r
     JOIN users u ON u.id = r.reviewer_id WHERE r.worker_id = ? ORDER BY r.id DESC`,
    [worker.id]
  );
  res.json({ success: true, reviews: rows });
});

export const idParam = [param('id').isInt()];
