import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { param } from 'express-validator';
import * as n from '../controllers/notification.controller.js';

const r = Router();

r.get('/', authenticate(), n.listNotifications);
r.patch('/:id/read', authenticate(), [param('id').isInt()], validate, n.markRead);
r.post('/read-all', authenticate(), n.markAllRead);

export default r;
