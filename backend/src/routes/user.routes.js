import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import * as user from '../controllers/user.controller.js';

const r = Router();

r.get('/profile', authenticate(), user.getProfile);
r.patch('/profile', authenticate(), user.profileValidators, validate, user.updateProfile);
r.post('/avatar', authenticate(), upload.single('avatar'), user.updateAvatar);

export default r;
