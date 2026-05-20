import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as ch from '../controllers/chat.controller.js';

const r = Router();

r.get('/:bookingId', authenticate(), ch.bookingIdParam, validate, ch.listMessages);
r.post('/:bookingId', authenticate(), ch.bookingIdParam, ch.chatValidators.send, validate, ch.sendMessage);

export default r;
