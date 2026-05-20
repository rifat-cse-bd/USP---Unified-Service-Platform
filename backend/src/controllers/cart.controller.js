import { body, param } from 'express-validator';
import { query, queryOne, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const cartValidators = {
  add: [
    body('service_id').isInt(),
    body('quantity').optional().isInt({ min: 1, max: 20 }),
    body('scheduled_at').optional().isISO8601(),
  ],
};

async function getOrCreateCart(userId) {
  let cart = await queryOne(`SELECT id FROM carts WHERE user_id = ?`, [userId]);
  if (!cart) {
    const r = await run(`INSERT INTO carts (user_id) VALUES (?)`, [userId]);
    cart = { id: r.insertId };
  }
  return cart.id;
}

export const getCart = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCart(req.user.id);
  const items = await query(
    `SELECT ci.*, s.title, s.base_price, s.duration_minutes, u.full_name AS worker_name, w.is_verified
     FROM cart_items ci
     JOIN services s ON s.id = ci.service_id
     JOIN workers w ON w.id = s.worker_id
     JOIN users u ON u.id = w.user_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );
  const subtotal = items.reduce((sum, i) => sum + Number(i.base_price) * i.quantity, 0);
  res.json({ success: true, cart_id: cartId, items, subtotal });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { service_id, quantity = 1, scheduled_at } = req.body;
  const svc = await queryOne(`SELECT id FROM services WHERE id = ? AND is_active = 1`, [service_id]);
  if (!svc) return res.status(404).json({ success: false, message: 'Service not found' });
  const cartId = await getOrCreateCart(req.user.id);
  await run(
    `INSERT INTO cart_items (cart_id, service_id, quantity, scheduled_at) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), scheduled_at = COALESCE(VALUES(scheduled_at), scheduled_at)`,
    [cartId, service_id, quantity, scheduled_at || null]
  );
  res.status(201).json({ success: true });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCart(req.user.id);
  await run(`UPDATE cart_items SET quantity = ?, scheduled_at = ? WHERE id = ? AND cart_id = ?`, [
    req.body.quantity,
    req.body.scheduled_at || null,
    req.params.itemId,
    cartId,
  ]);
  res.json({ success: true });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCart(req.user.id);
  await run(`DELETE FROM cart_items WHERE id = ? AND cart_id = ?`, [req.params.itemId, cartId]);
  res.json({ success: true });
});

export const checkoutCart = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCart(req.user.id);
  const items = await query(`SELECT * FROM cart_items WHERE cart_id = ?`, [cartId]);
  if (!items.length) return res.status(400).json({ success: false, message: 'Cart is empty' });
  const bookings = [];
  const io = req.app.get('io');
  const { notifyUser, emitBookingUpdate } = await import('../utils/notifications.js');

  for (const item of items) {
    const service = await queryOne(
      `SELECT s.*, w.id AS worker_pk, w.user_id AS worker_owner_id FROM services s
       JOIN workers w ON w.id = s.worker_id WHERE s.id = ?`,
      [item.service_id]
    );
    if (!service) continue;
    const scheduled_at = item.scheduled_at || new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' ');
    const address = req.body.default_address || 'Address to be confirmed with worker';
    const r = await run(
      `INSERT INTO bookings (customer_id, worker_id, service_id, scheduled_at, address, notes, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        req.user.id,
        service.worker_pk,
        service.id,
        scheduled_at,
        address,
        'From cart checkout',
        Number(service.base_price) * item.quantity,
      ]
    );
    const booking = await queryOne(`SELECT * FROM bookings WHERE id = ?`, [r.insertId]);
    bookings.push(booking);
    await notifyUser(io, service.worker_owner_id, {
      type: 'booking',
      title: 'New booking (cart)',
      body: `Booking #${booking.id} from cart`,
      data: { booking_id: booking.id },
    });
    await emitBookingUpdate(io, booking);
  }
  await run(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
  res.json({ success: true, bookings });
});

export const itemIdParam = [param('itemId').isInt()];
