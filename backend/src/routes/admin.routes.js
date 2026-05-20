import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as a from '../controllers/admin.controller.js';

const r = Router();

r.use(authenticate());
r.use(authorize('admin'));

r.get('/stats', a.dashboardStats);
r.get('/analytics', a.analytics);
r.get('/users', a.listUsers);
r.get('/workers', a.listWorkersAdmin);
r.get('/documents', a.listDocuments);
r.patch('/documents/:id', a.idParam, a.adminValidators.verifyDoc, validate, a.verifyDocument);
r.get('/bookings', a.listBookingsAdmin);
r.get('/payments', a.listPaymentsAdmin);
r.get('/reviews', a.listReviewsAdmin);
r.get('/services', a.listServicesAdmin);
r.patch('/users/:id/ban', a.idParam, a.adminValidators.banUser, validate, a.banUser);
r.patch('/users/:id/suspend', a.idParam, a.adminValidators.suspendUser, validate, a.suspendUser);
r.get('/complaints', a.listComplaints);
r.patch('/complaints/:id', a.idParam, a.adminValidators.complaintStatus, validate, a.updateComplaint);

export default r;
