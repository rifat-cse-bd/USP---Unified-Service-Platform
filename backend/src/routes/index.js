import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import workerRoutes from './worker.routes.js';
import serviceRoutes from './service.routes.js';
import bookingRoutes from './booking.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import notificationRoutes from './notification.routes.js';
import cartRoutes from './cart.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import chatRoutes from './chat.routes.js';
import adminRoutes from './admin.routes.js';
import complaintRoutes from './complaint.routes.js';
import contactRoutes from './contact.routes.js';

const api = Router();

api.use('/auth', authRoutes);
api.use('/users', userRoutes);
api.use('/workers', workerRoutes);
api.use('/services', serviceRoutes);
api.use('/bookings', bookingRoutes);
api.use('/payments', paymentRoutes);
api.use('/reviews', reviewRoutes);
api.use('/notifications', notificationRoutes);
api.use('/cart', cartRoutes);
api.use('/wishlist', wishlistRoutes);
api.use('/chat', chatRoutes);
api.use('/admin', adminRoutes);
api.use('/complaints', complaintRoutes);
api.use('/contact', contactRoutes);

export default api;
