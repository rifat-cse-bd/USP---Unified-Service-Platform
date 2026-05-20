import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import * as auth from '../controllers/auth.controller.js';

const r = Router();

r.post('/register', auth.authValidators.register, validate, auth.register);
r.post('/login', auth.authValidators.login, validate, auth.login);
r.post('/forgot-password', auth.authValidators.forgot, validate, auth.forgotPassword);
r.post('/reset-password', auth.authValidators.reset, validate, auth.resetPassword);
r.get('/me', authenticate(), auth.me);
r.patch('/fcm-token', authenticate(), auth.updateFcmToken);

export default r;
