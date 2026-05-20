import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as b from '../controllers/booking.controller.js';

const r = Router();

r.post('/', authenticate(), authorize('customer', 'admin'), b.bookingValidators.create, validate, b.createBooking);
r.get('/', authenticate(), b.listMyBookings);
r.get('/:id', authenticate(), b.idParam, validate, b.getBooking);
r.patch('/:id/status', authenticate(), b.idParam, b.bookingValidators.status, validate, b.updateBookingStatus);
r.patch('/:id/tracking', authenticate(), b.idParam, b.bookingValidators.tracking, validate, b.updateTracking);

export default r;
