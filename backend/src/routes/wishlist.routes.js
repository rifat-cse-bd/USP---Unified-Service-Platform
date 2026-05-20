import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as w from '../controllers/wishlist.controller.js';

const r = Router();

r.use(authenticate());
r.use(authorize('customer', 'admin'));

r.get('/', w.listWishlist);
r.post('/', w.wishValidators.add, validate, w.addWishlist);
r.delete('/:serviceId', w.serviceIdParam, validate, w.removeWishlist);

export default r;
