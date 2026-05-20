import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as rev from '../controllers/review.controller.js';

const r = Router();

r.post('/', authenticate(), authorize('customer', 'admin'), rev.reviewValidators.create, validate, rev.createReview);
r.get('/given', authenticate(), authorize('customer', 'admin'), rev.listGivenByMe);
r.get('/worker', authenticate(), authorize('worker'), rev.listForWorker);

export default r;
