import { body, param } from 'express-validator';
import { query, queryOne, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notifyUser, emitBookingUpdate } from '../utils/notifications.js';
import { recordBookingStatus } from '../utils/bookingHistory.js';
import { toMysqlDatetime } from '../utils/datetime.js';

export const bookingValidators = {
  create: [
    body('service_id').isInt(),
    body('scheduled_at').isISO8601(),
    body('address').trim().notEmpty(),
    body('notes').optional().trim(),
  ],
  status: [body('status').isIn(['accepted', 'rejected', 'in_progress', 'completed', 'cancelled'])],
  tracking: [body('tracking_note').optional().trim().isLength({ max: 500 })],
};

export const createBooking = asyncHandler(async (req, res) => {
  const { service_id, scheduled_at, address, notes } = req.body;
  const service = await queryOne(
    `SELECT s.*, w.id AS worker_pk, w.user_id AS worker_owner_id FROM services s
     JOIN workers w ON w.id = s.worker_id WHERE s.id = ? AND s.is_active = 1`,
    [service_id]
  );
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
  if (service.worker_owner_id === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot book your own service' });
  }
  const total_price = Number(service.base_price);
  const scheduledAtMysql = toMysqlDatetime(scheduled_at);
  const r = await run(
    `INSERT INTO bookings (customer_id, worker_id, service_id, scheduled_at, address, notes, total_price, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [req.user.id, service.worker_pk, service_id, scheduledAtMysql, address, notes || null, total_price]
  );
  const booking = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [r.insertId]);
  await recordBookingStatus(booking.id, 'pending', req.user.id, 'Booking created');
  const io = req.app.get('io');
  await notifyUser(io, service.worker_owner_id, {
    type: 'booking',
    title: 'New booking request',
    body: `A customer booked ${service.title}`,
    data: { booking_id: booking.id },
  });
  await notifyUser(io, req.user.id, {
    type: 'booking',
    title: 'Booking placed',
    body: 'Your request was sent to the worker.',
    data: { booking_id: booking.id },
  });
  await emitBookingUpdate(io, booking);
  res.status(201).json({ success: true, booking });
});

export const listMyBookings = asyncHandler(async (req, res) => {
  const role = req.user.role;
  let sql;
  const params = [];
  if (role === 'customer') {
    sql = `SELECT b.*, s.title AS service_title, u.full_name AS worker_name
           FROM bookings b
           JOIN services s ON s.id = b.service_id
           JOIN workers w ON w.id = b.worker_id
           JOIN users u ON u.id = w.user_id
           WHERE b.customer_id = ? ORDER BY b.id DESC`;
    params.push(req.user.id);
  } else if (role === 'worker') {
    const w = await queryOne(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
    if (!w) return res.json({ success: true, bookings: [] });
    sql = `SELECT b.*, s.title AS service_title, u.full_name AS customer_name
           FROM bookings b
           JOIN services s ON s.id = b.service_id
           JOIN users u ON u.id = b.customer_id
           WHERE b.worker_id = ? ORDER BY b.id DESC`;
    params.push(w.id);
  } else {
    sql = `SELECT b.*, s.title AS service_title FROM bookings b JOIN services s ON s.id = b.service_id ORDER BY b.id DESC LIMIT 100`;
  }
  const bookings = await query(sql, params);
  res.json({ success: true, bookings });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await queryOne(
    `SELECT b.*, s.title AS service_title, s.description AS service_description,
            w.user_id AS worker_user_id, cust.full_name AS customer_name, work.full_name AS worker_name
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN workers w ON w.id = b.worker_id
     JOIN users cust ON cust.id = b.customer_id
     JOIN users work ON work.id = w.user_id
     WHERE b.id = ?`,
    [req.params.id]
  );
  if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
  const isCustomer = booking.customer_id === req.user.id;
  const isWorker = booking.worker_user_id === req.user.id;
  if (!isCustomer && !isWorker && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const history = await query(
    `SELECT h.*, u.full_name AS changed_by_name FROM booking_status_history h
     LEFT JOIN users u ON u.id = h.changed_by WHERE h.booking_id = ? ORDER BY h.id ASC`,
    [booking.id]
  );
  res.json({ success: true, booking, status_history: history });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [req.params.id]);
  if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
  const worker = await queryOne(`SELECT id, user_id FROM workers WHERE id = ?`, [booking.worker_id]);
  const isWorker = worker?.user_id === req.user.id;
  const isCustomer = booking.customer_id === req.user.id;

  if (status === 'accepted' || status === 'rejected' || status === 'in_progress' || status === 'completed') {
    if (!isWorker && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only worker can update to this status' });
    }
  }
  if (status === 'rejected' && booking.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending bookings can be rejected' });
  }
  if (status === 'cancelled') {
    if (!isCustomer && !isWorker && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
  }

  await run(`UPDATE bookings SET status = ? WHERE id = ?`, [status, booking.id]);
  await recordBookingStatus(booking.id, status, req.user.id);
  const updated = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [booking.id]);
  const io = req.app.get('io');
  await notifyUser(io, booking.customer_id, {
    type: 'booking',
    title: 'Booking update',
    body: `Status is now ${status}`,
    data: { booking_id: booking.id },
  });
  if (worker?.user_id) {
    await notifyUser(io, worker.user_id, {
      type: 'booking',
      title: 'Booking update',
      body: `Status is now ${status}`,
      data: { booking_id: booking.id },
    });
  }
  await emitBookingUpdate(io, updated);
  res.json({ success: true, booking: updated });
});

export const updateTracking = asyncHandler(async (req, res) => {
  const booking = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [req.params.id]);
  if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
  const worker = await queryOne(`SELECT user_id FROM workers WHERE id = ?`, [booking.worker_id]);
  if (worker?.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  await run(`UPDATE bookings SET tracking_note = ? WHERE id = ?`, [req.body.tracking_note || null, booking.id]);
  const updated = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [booking.id]);
  const io = req.app.get('io');
  await notifyUser(io, booking.customer_id, {
    type: 'booking',
    title: 'Order tracking',
    body: req.body.tracking_note || 'Updated',
    data: { booking_id: booking.id },
  });
  await emitBookingUpdate(io, updated);
  res.json({ success: true, booking: updated });
});

export const idParam = [param('id').isInt()];
