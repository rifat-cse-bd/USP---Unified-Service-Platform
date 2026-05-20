import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as c from '../controllers/cart.controller.js';

const r = Router();

r.use(authenticate());
r.use(authorize('customer', 'admin'));

r.get('/', c.getCart);
r.post('/items', c.cartValidators.add, validate, c.addToCart);
r.patch('/items/:itemId', c.itemIdParam, validate, c.updateCartItem);
r.delete('/items/:itemId', c.itemIdParam, validate, c.removeCartItem);
r.post('/checkout', c.checkoutCart);

export default r;
