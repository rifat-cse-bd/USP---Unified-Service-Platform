import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as p from '../controllers/payment.controller.js';

const r = Router();

r.get('/stripe/config', p.getStripeConfig);
r.post('/stripe/create-intent', authenticate(), p.payValidators.stripeIntent, validate, p.createStripeIntent);
r.post('/stripe/confirm', authenticate(), p.payValidators.stripeConfirm, validate, p.confirmStripePayment);
r.post('/mock', authenticate(), p.payValidators.mockPay, validate, p.mockPay);
r.get('/mine', authenticate(), p.listMyPayments);
r.get('/invoice/:id', authenticate(), p.idParam, validate, p.getInvoice);

export default r;
