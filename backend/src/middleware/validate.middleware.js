import { validationResult } from 'express-validator';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arr = errors.array();
    return res.status(400).json({
      success: false,
      message: arr[0]?.msg || 'Validation failed',
      errors: arr,
    });
  }
  next();
}
