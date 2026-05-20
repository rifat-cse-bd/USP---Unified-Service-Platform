import { body, param } from 'express-validator';
import { query, queryOne, run } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateInvoiceNumber } from '../utils/invoice.js';
import { notifyUser } from '../utils/notifications.js';
import { splitPayment } from '../utils/commission.js';
import { getStripe, isStripeEnabled } from '../config/stripe.js';
import { toStripeCharge } from '../utils/stripeAmount.js';

export const payValidators = {
  mockPay: [
    body('booking_id').isInt(),
    body('provider').isIn(['bkash', 'nagad', 'mock_card']),
    body('simulate').optional().isIn(['success', 'failure']),
  ],
  stripeIntent: [body('booking_id').isInt()],
  stripeConfirm: [body('booking_id').isInt(), body('payment_intent_id').notEmpty()],
};

async function assertBookingPayable(booking_id, userId, role) {
  const booking = await queryOne(
    `SELECT b.*, s.title FROM bookings b JOIN services s ON s.id = b.service_id WHERE b.id = ?`,
    [booking_id]
  );
  if (!booking) return { error: { status: 404, message: 'Booking not found' } };
  if (booking.customer_id !== userId && role !== 'admin') {
    return { error: { status: 403, message: 'Forbidden' } };
  }
  if (booking.status === 'cancelled' || booking.status === 'rejected') {
    return { error: { status: 400, message: 'Booking cannot be paid' } };
  }
  const existing = await queryOne(
    `SELECT id FROM payments WHERE booking_id = ? AND status = 'completed'`,
    [booking_id]
  );
  if (existing) return { error: { status: 400, message: 'Booking already paid' } };
  return { booking };
}

async function finalizePayment(io, booking, paymentId, provider, status) {
  if (status !== 'completed') {
    await notifyUser(io, booking.customer_id, {
      type: 'payment',
      title: 'Payment failed',
      body: 'Your payment could not be processed. Please try again.',
      data: { booking_id: booking.id },
    });
    return;
  }
  await notifyUser(io, booking.customer_id, {
    type: 'payment',
    title: 'Payment successful',
    body: `Paid ৳${booking.total_price} for ${booking.title}`,
    data: { payment_id: paymentId, booking_id: booking.id },
  });
  const worker = await queryOne(`SELECT user_id FROM workers WHERE id = ?`, [booking.worker_id]);
  if (worker?.user_id) {
    await notifyUser(io, worker.user_id, {
      type: 'payment',
      title: 'Payment received',
      body: `Customer paid for booking #${booking.id}. Your payout will be processed after commission.`,
      data: { payment_id: paymentId, booking_id: booking.id },
    });
  }
}

async function markStripePaymentCompleted(intent, io) {
  const booking_id = intent.metadata?.booking_id;
  if (!booking_id) return null;

  const payment = await queryOne(
    `SELECT * FROM payments WHERE stripe_payment_intent_id = ? OR (booking_id = ? AND provider = 'stripe' AND status = 'pending')`,
    [intent.id, booking_id]
  );
  if (!payment) return null;
  if (payment.status === 'completed') return payment;

  await run(
    `UPDATE payments SET status = 'completed', transaction_ref = ?, stripe_payment_intent_id = ?, meta = ?
     WHERE id = ?`,
    [
      intent.id,
      intent.id,
      JSON.stringify({ stripe_status: intent.status, charge: intent.latest_charge }),
      payment.id,
    ]
  );

  const booking = await queryOne(`SELECT b.*, s.title FROM bookings b JOIN services s ON s.id = b.service_id WHERE b.id = ?`, [
    booking_id,
  ]);
  if (booking && io) {
    await finalizePayment(io, booking, payment.id, 'stripe', 'completed');
  }
  return queryOne(`SELECT * FROM payments WHERE id = ?`, [payment.id]);
}

/** Mock gateway */
export const mockPay = asyncHandler(async (req, res) => {
  const { booking_id, provider, simulate = 'success' } = req.body;
  const check = await assertBookingPayable(booking_id, req.user.id, req.user.role);
  if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
  const { booking } = check;

  const split = splitPayment(booking.total_price);
  const invoice_number = generateInvoiceNumber();
  const trx = `MOCK-${provider.toUpperCase()}-${Date.now()}`;
  const status = simulate === 'failure' ? 'failed' : 'completed';
  const r = await run(
    `INSERT INTO payments (booking_id, payer_id, amount, platform_commission, worker_payout, provider, status, transaction_ref, invoice_number, meta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      booking_id,
      req.user.id,
      split.amount,
      split.platform_commission,
      split.worker_payout,
      provider,
      status,
      trx,
      invoice_number,
      JSON.stringify({ mock: true, provider, commission_rate: process.env.PLATFORM_COMMISSION_RATE || 0.2 }),
    ]
  );

  const io = req.app.get('io');
  await finalizePayment(io, booking, r.insertId, provider, status);

  const payment = await queryOne(`SELECT * FROM payments WHERE id = ?`, [r.insertId]);
  res.status(201).json({
    success: true,
    payment: formatPayment(payment),
    redirectUrl: status === 'completed' ? `/customer/payments?highlight=${payment.id}` : null,
  });
});

/** Create or reuse Stripe PaymentIntent */
export const createStripeIntent = asyncHandler(async (req, res) => {
  if (!isStripeEnabled()) {
    return res.status(503).json({ success: false, message: 'Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env' });
  }
  const { booking_id } = req.body;
  const check = await assertBookingPayable(booking_id, req.user.id, req.user.role);
  if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
  const { booking } = check;

  const split = splitPayment(booking.total_price);
  const stripe = getStripe();
  const charge = toStripeCharge(split.amount);

  const pending = await queryOne(
    `SELECT * FROM payments WHERE booking_id = ? AND provider = 'stripe' AND status = 'pending' AND stripe_payment_intent_id IS NOT NULL ORDER BY id DESC LIMIT 1`,
    [booking_id]
  );

  if (pending?.stripe_payment_intent_id) {
    try {
      const existing = await stripe.paymentIntents.retrieve(pending.stripe_payment_intent_id);
      if (existing.status === 'requires_payment_method' || existing.status === 'requires_confirmation') {
        return res.json({
          success: true,
          clientSecret: existing.client_secret,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
          amount: split.amount,
          platform_commission: split.platform_commission,
          worker_payout: split.worker_payout,
          stripe_currency: charge.currency,
          stripe_display_note: charge.displayNote,
        });
      }
      if (existing.status === 'succeeded') {
        const io = req.app.get('io');
        await markStripePaymentCompleted(existing, io);
        return res.status(400).json({ success: false, message: 'Booking already paid' });
      }
    } catch {
      /* create new intent below */
    }
  }

  let intent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: charge.unitAmount,
      currency: charge.currency,
      metadata: {
        booking_id: String(booking_id),
        payer_id: String(req.user.id),
        platform_commission: String(split.platform_commission),
        worker_payout: String(split.worker_payout),
        amount_bdt: String(split.amount),
      },
      automatic_payment_methods: { enabled: true },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Stripe could not create payment',
      hint: 'If currency fails, set STRIPE_CURRENCY=usd and STRIPE_BDT_PER_USD=110 in backend/.env',
    });
  }

  if (pending) {
    await run(
      `UPDATE payments SET amount = ?, platform_commission = ?, worker_payout = ?, stripe_payment_intent_id = ?, meta = ? WHERE id = ?`,
      [
        split.amount,
        split.platform_commission,
        split.worker_payout,
        intent.id,
        JSON.stringify({ stripe_status: intent.status, stripe_currency: charge.currency }),
        pending.id,
      ]
    );
  } else {
    await run(
      `INSERT INTO payments (booking_id, payer_id, amount, platform_commission, worker_payout, provider, status, stripe_payment_intent_id, invoice_number, meta)
       VALUES (?, ?, ?, ?, ?, 'stripe', 'pending', ?, ?, ?)`,
      [
        booking_id,
        req.user.id,
        split.amount,
        split.platform_commission,
        split.worker_payout,
        intent.id,
        generateInvoiceNumber(),
        JSON.stringify({ stripe_status: intent.status, stripe_currency: charge.currency }),
      ]
    );
  }

  res.json({
    success: true,
    clientSecret: intent.client_secret,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    amount: split.amount,
    platform_commission: split.platform_commission,
    worker_payout: split.worker_payout,
    stripe_currency: charge.currency,
    stripe_display_note: charge.displayNote,
  });
});

/** Confirm after client-side Payment Element success */
export const confirmStripePayment = asyncHandler(async (req, res) => {
  if (!isStripeEnabled()) {
    return res.status(503).json({ success: false, message: 'Stripe not configured' });
  }
  const { booking_id, payment_intent_id } = req.body;
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(payment_intent_id);

  if (intent.metadata?.booking_id && String(intent.metadata.booking_id) !== String(booking_id)) {
    return res.status(400).json({ success: false, message: 'Payment intent does not match booking' });
  }

  if (intent.status !== 'succeeded') {
    await run(
      `UPDATE payments SET status = 'failed', meta = ? WHERE stripe_payment_intent_id = ?`,
      [JSON.stringify({ stripe_status: intent.status }), payment_intent_id]
    );
    return res.status(400).json({ success: false, message: `Payment not completed: ${intent.status}` });
  }

  const check = await assertBookingPayable(booking_id, req.user.id, req.user.role);
  if (check.error) {
    const paid = await queryOne(`SELECT * FROM payments WHERE booking_id = ? AND status = 'completed'`, [booking_id]);
    if (paid) return res.json({ success: true, payment: formatPayment(paid) });
    if (check.error.message !== 'Booking already paid') {
      return res.status(check.error.status).json({ success: false, message: check.error.message });
    }
  }

  const io = req.app.get('io');
  const payment = await markStripePaymentCompleted(intent, io);
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found' });
  }

  res.json({ success: true, payment: formatPayment(payment) });
});

/** Stripe webhook (optional — set STRIPE_WEBHOOK_SECRET) */
export const stripeWebhook = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return res.status(503).send('Webhook not configured');
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const io = req.app.get('io');
    await markStripePaymentCompleted(event.data.object, io);
  }

  res.json({ received: true });
});

export const getStripeConfig = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    enabled: isStripeEnabled() && Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    commissionRate: Number(process.env.PLATFORM_COMMISSION_RATE) || 0.2,
    currency: process.env.STRIPE_CURRENCY || 'usd',
  });
});

function formatPayment(p) {
  if (!p) return p;
  return {
    ...p,
    status_label: p.status === 'completed' ? 'paid' : p.status,
  };
}

export const listMyPayments = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT p.*, s.title AS service_title, b.status AS booking_status
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     JOIN services s ON s.id = b.service_id
     WHERE p.payer_id = ? ORDER BY p.id DESC`,
    [req.user.id]
  );
  res.json({ success: true, payments: rows.map(formatPayment) });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const payment = await queryOne(
    `SELECT p.*, b.scheduled_at, b.address, u.full_name AS payer_name, s.title AS service_title,
            wk.user_id AS worker_user_id, wu.full_name AS worker_name
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     JOIN users u ON u.id = p.payer_id
     JOIN services s ON s.id = b.service_id
     JOIN workers wk ON wk.id = b.worker_id
     JOIN users wu ON wu.id = wk.user_id
     WHERE p.id = ?`,
    [req.params.id]
  );
  if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
  if (payment.payer_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  res.json({
    success: true,
    invoice: {
      ...formatPayment(payment),
      line_items: [
        { label: 'Service total (BDT)', amount: payment.amount },
        { label: 'Platform commission (20%)', amount: payment.platform_commission },
        { label: 'Worker payout (80%)', amount: payment.worker_payout },
      ],
    },
  });
});

export const idParam = [param('id').isInt()];
