import { verifyToken } from '../utils/tokens.js';
import { queryOne } from '../config/database.js';

export function authenticate({ optional = false } = {}) {
  return async (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      if (optional) return next();
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    try {
      const decoded = verifyToken(token);
      const user = await queryOne(
        `SELECT id, email, role, full_name, is_banned, suspended_until FROM users WHERE id = ? AND is_active = 1`,
        [decoded.sub]
      );
      if (!user) {
        if (optional) return next();
        return res.status(401).json({ success: false, message: 'Invalid session' });
      }
      if (user.is_banned) {
        if (optional) return next();
        return res.status(403).json({ success: false, message: 'Account is banned' });
      }
      if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
        if (optional) return next();
        return res.status(403).json({ success: false, message: 'Account is suspended' });
      }
      req.user = user;
      next();
    } catch {
      if (optional) return next();
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  };
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
}
