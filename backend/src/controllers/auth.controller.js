import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { body } from 'express-validator';
import { query, queryOne, run } from '../config/database.js';
import { signToken } from '../utils/tokens.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('full_name').trim().notEmpty(),
  body('role').optional().isIn(['customer', 'worker']),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const authValidators = {
  register: registerValidation,
  login: loginValidation,
  forgot: [body('email').isEmail().normalizeEmail()],
  reset: [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
};

export const register = asyncHandler(async (req, res) => {
  const { email, password, full_name, phone, role = 'customer' } = req.body;
  if (role === 'admin') {
    return res.status(403).json({ success: false, message: 'Cannot self-register as admin' });
  }
  const existing = await queryOne(`SELECT id FROM users WHERE email = ?`, [email]);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }
  const password_hash = await bcrypt.hash(password, 12);
  const r = await run(
    `INSERT INTO users (email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?)`,
    [email, password_hash, role, full_name, phone || null]
  );
  const userId = r.insertId;
  if (role === 'worker') {
    await run(`INSERT INTO workers (user_id, headline, bio, hourly_rate) VALUES (?, ?, ?, ?)`, [
      userId,
      'New WorkSure professional',
      '',
      0,
    ]);
  }
  const user = await queryOne(
    `SELECT id, email, role, full_name, phone, avatar_url, city FROM users WHERE id = ?`,
    [userId]
  );
  const token = signToken({ sub: user.id, role: user.role });
  res.status(201).json({ success: true, token, user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await queryOne(
    `SELECT id, email, password_hash, role, full_name, phone, avatar_url, city, is_banned, suspended_until FROM users WHERE email = ?`,
    [email]
  );
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (user.is_banned) {
    return res.status(403).json({ success: false, message: 'Account is banned' });
  }
  if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
    return res.status(403).json({ success: false, message: 'Account is suspended' });
  }
  delete user.password_hash;
  const token = signToken({ sub: user.id, role: user.role });
  res.json({ success: true, token, user });
});

export const me = asyncHandler(async (req, res) => {
  const user = await queryOne(
    `SELECT id, email, role, full_name, phone, avatar_url, address, city, country, latitude, longitude, created_at FROM users WHERE id = ?`,
    [req.user.id]
  );
  let worker = null;
  if (user.role === 'worker') {
    worker = await queryOne(`SELECT * FROM workers WHERE user_id = ?`, [user.id]);
  }
  res.json({ success: true, user, worker });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await queryOne(`SELECT id FROM users WHERE email = ?`, [email]);
  const generic = { success: true, message: 'If an account exists, reset instructions were sent.' };
  if (!user) return res.json(generic);
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await run(`UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?`, [
    token,
    expires,
    user.id,
  ]);
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${base}/reset-password?token=${token}`;
  console.info(`[WorkSure] Password reset for ${email}: ${link}`);
  if (process.env.NODE_ENV === 'development') {
    return res.json({ ...generic, devResetLink: link });
  }
  res.json(generic);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await queryOne(
    `SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()`,
    [token]
  );
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
  const password_hash = await bcrypt.hash(password, 12);
  await run(
    `UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?`,
    [password_hash, user.id]
  );
  res.json({ success: true, message: 'Password updated. You can sign in now.' });
});

export const updateFcmToken = asyncHandler(async (req, res) => {
  const { fcm_token } = req.body;
  await run(`UPDATE users SET fcm_token = ? WHERE id = ?`, [fcm_token || null, req.user.id]);
  res.json({ success: true });
});
