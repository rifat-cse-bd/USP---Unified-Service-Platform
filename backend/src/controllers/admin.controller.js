import { body, param } from 'express-validator';
import { query, queryOne, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function logAdmin(adminId, action, target_type, target_id, details) {
  await run(`INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`, [
    adminId,
    action,
    target_type,
    target_id,
    details ? JSON.stringify(details) : null,
  ]);
}

export const adminValidators = {
  verifyDoc: [
    body('status').isIn(['approved', 'rejected']),
    body('admin_note').optional().trim(),
  ],
  banUser: [
    body('is_banned')
      .custom((v) => [true, false, 1, 0, '1', '0', 'true', 'false'].includes(v))
      .withMessage('is_banned must be true or false'),
  ],
  suspendUser: [body('until').optional().isISO8601()],
  complaintStatus: [
    body('status').isIn(['open', 'reviewing', 'resolved', 'dismissed']),
    body('resolution_note').optional().trim(),
  ],
};

export const dashboardStats = asyncHandler(async (req, res) => {
  const users = await queryOne(`SELECT COUNT(*) AS c FROM users`);
  const workers = await queryOne(`SELECT COUNT(*) AS c FROM workers`);
  const bookings = await queryOne(`SELECT COUNT(*) AS c FROM bookings`);
  const revenue = await queryOne(`SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status='completed'`);
  const pendingDocs = await queryOne(`SELECT COUNT(*) AS c FROM worker_documents WHERE status='pending'`);
  const openComplaints = await queryOne(`SELECT COUNT(*) AS c FROM complaints WHERE status IN ('open','reviewing')`);
  res.json({
    success: true,
    stats: {
      users: users.c,
      workers: workers.c,
      bookings: bookings.c,
      revenue: Number(revenue.total),
      pendingDocs: pendingDocs.c,
      openComplaints: openComplaints.c,
    },
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const offset = (page - 1) * limit;
  const rows = await query(
    `SELECT id, email, role, full_name, phone, city, is_banned, suspended_until, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const totalRow = await queryOne(`SELECT COUNT(*) AS c FROM users`);
  res.json({ success: true, data: rows, total: totalRow.c, page, limit });
});

export const listWorkersAdmin = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT w.*, u.email, u.full_name, u.city, u.is_banned FROM workers w JOIN users u ON u.id = w.user_id ORDER BY w.id DESC`
  );
  res.json({ success: true, data: rows });
});

export const listDocuments = asyncHandler(async (_req, res) => {
  const rows = await query(
    `SELECT d.*, u.full_name AS worker_name FROM worker_documents d
     JOIN workers w ON w.id = d.worker_id
     JOIN users u ON u.id = w.user_id
     ORDER BY FIELD(d.status,'pending') DESC, d.id DESC`
  );
  res.json({ success: true, data: rows });
});

export const verifyDocument = asyncHandler(async (req, res) => {
  const { status, admin_note } = req.body;
  const doc = await queryOne(`SELECT * FROM worker_documents WHERE id = ?`, [req.params.id]);
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  await run(
    `UPDATE worker_documents SET status = ?, admin_note = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
    [status, admin_note || null, req.user.id, doc.id]
  );
  if (status === 'approved') {
    await run(`UPDATE workers SET is_verified = 1, verified_at = NOW() WHERE id = ?`, [doc.worker_id]);
  } else if (status === 'rejected') {
    await run(`UPDATE workers SET is_verified = 0, verified_at = NULL WHERE id = ?`, [doc.worker_id]);
  }
  await logAdmin(req.user.id, 'verify_document', 'worker_document', doc.id, { status });
  const worker = await queryOne(
    `SELECT u.full_name FROM workers w JOIN users u ON u.id = w.user_id WHERE w.id = ?`,
    [doc.worker_id]
  );
  res.json({
    success: true,
    message: status === 'approved' ? `${worker?.full_name || 'Worker'} is now verified` : 'Document rejected',
    status,
  });
});

export const listBookingsAdmin = asyncHandler(async (_req, res) => {
  const rows = await query(
    `SELECT b.*, s.title AS service_title, c.name AS category_name,
            cust.full_name AS customer_name, cust.email AS customer_email, cust.phone AS customer_phone,
            wu.full_name AS worker_name, wu.email AS worker_email, wu.phone AS worker_phone
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN categories c ON c.id = s.category_id
     JOIN users cust ON cust.id = b.customer_id
     JOIN workers w ON w.id = b.worker_id
     JOIN users wu ON wu.id = w.user_id
     ORDER BY b.id DESC LIMIT 200`
  );
  res.json({ success: true, data: rows });
});

export const listPaymentsAdmin = asyncHandler(async (_req, res) => {
  const rows = await query(
    `SELECT p.*, s.title AS service_title, b.status AS booking_status,
            u.full_name AS payer_name, u.email AS payer_email
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     JOIN services s ON s.id = b.service_id
     JOIN users u ON u.id = p.payer_id
     ORDER BY p.id DESC LIMIT 200`
  );
  res.json({ success: true, data: rows });
});

export const listReviewsAdmin = asyncHandler(async (_req, res) => {
  const rows = await query(
    `SELECT r.*, u.full_name AS reviewer_name, s.title AS service_title, wu.full_name AS worker_name
     FROM reviews r
     JOIN users u ON u.id = r.reviewer_id
     JOIN bookings b ON b.id = r.booking_id
     JOIN services s ON s.id = b.service_id
     JOIN workers w ON w.id = r.worker_id
     JOIN users wu ON wu.id = w.user_id
     ORDER BY r.id DESC LIMIT 200`
  );
  res.json({ success: true, data: rows });
});

export const listServicesAdmin = asyncHandler(async (_req, res) => {
  const rows = await query(
    `SELECT s.*, c.name AS category_name, u.full_name AS worker_name FROM services s
     JOIN categories c ON c.id = s.category_id
     JOIN workers w ON w.id = s.worker_id
     JOIN users u ON u.id = w.user_id
     ORDER BY s.id DESC LIMIT 200`
  );
  res.json({ success: true, data: rows });
});

function parseBool(v) {
  return v === true || v === 1 || v === '1' || v === 'true';
}

export const banUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  const target = await queryOne(`SELECT id, role, full_name, email FROM users WHERE id = ?`, [userId]);
  if (!target) return res.status(404).json({ success: false, message: 'User not found' });
  if (target.role === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot ban admin accounts' });
  }
  if (userId === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot ban your own account' });
  }

  const isBanned = parseBool(req.body.is_banned) ? 1 : 0;
  await run(`UPDATE users SET is_banned = ? WHERE id = ?`, [isBanned, userId]);
  await logAdmin(req.user.id, 'ban_user', 'user', userId, { is_banned: Boolean(isBanned) });
  res.json({
    success: true,
    message: isBanned ? `${target.full_name} has been banned` : `${target.full_name} has been unbanned`,
    is_banned: Boolean(isBanned),
  });
});

export const suspendUser = asyncHandler(async (req, res) => {
  const until = req.body.until || null;
  await run(`UPDATE users SET suspended_until = ? WHERE id = ?`, [until, req.params.id]);
  await logAdmin(req.user.id, 'suspend_user', 'user', Number(req.params.id), { until });
  res.json({ success: true });
});

export const listComplaints = asyncHandler(async (_req, res) => {
  const rows = await query(
    `SELECT c.*, u.full_name AS reporter_name FROM complaints c JOIN users u ON u.id = c.reporter_id ORDER BY c.id DESC`
  );
  res.json({ success: true, data: rows });
});

export const updateComplaint = asyncHandler(async (req, res) => {
  const { status, resolution_note } = req.body;
  await run(`UPDATE complaints SET status = ?, resolution_note = ? WHERE id = ?`, [
    status,
    resolution_note || null,
    req.params.id,
  ]);
  await logAdmin(req.user.id, 'complaint_update', 'complaint', Number(req.params.id), { status });
  res.json({ success: true });
});

export const analytics = asyncHandler(async (_req, res) => {
  const bookingsByStatus = await query(
    `SELECT status, COUNT(*) AS count FROM bookings GROUP BY status`
  );
  const revenueByMonth = await query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS total
     FROM payments WHERE status='completed' GROUP BY month ORDER BY month DESC LIMIT 12`
  );
  const topWorkers = await query(
    `SELECT w.id, u.full_name, w.rating_avg, w.rating_count FROM workers w
     JOIN users u ON u.id = w.user_id ORDER BY w.rating_avg DESC, w.rating_count DESC LIMIT 10`
  );
  const orderRows = await query(
    `SELECT b.id, b.status, b.scheduled_at, b.total_price, b.address, b.created_at,
            s.title AS service_title,
            cust.id AS customer_id, cust.full_name AS customer_name, cust.email AS customer_email,
            cust.phone AS customer_phone,
            w.id AS worker_id, wu.full_name AS worker_name, wu.email AS worker_email,
            wu.phone AS worker_phone
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN users cust ON cust.id = b.customer_id
     JOIN workers w ON w.id = b.worker_id
     JOIN users wu ON wu.id = w.user_id
     ORDER BY FIELD(b.status,'pending','accepted','in_progress','completed','rejected','cancelled'), b.id DESC
     LIMIT 500`
  );
  const ordersByStatus = {
    pending: [],
    accepted: [],
    in_progress: [],
    completed: [],
    rejected: [],
    cancelled: [],
  };
  for (const row of orderRows) {
    if (ordersByStatus[row.status]) ordersByStatus[row.status].push(row);
  }
  res.json({ success: true, bookingsByStatus, revenueByMonth, topWorkers, ordersByStatus });
});

export const idParam = [param('id').isInt()];
