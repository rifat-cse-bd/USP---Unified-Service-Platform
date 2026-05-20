import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import * as worker from '../controllers/worker.controller.js';

const r = Router();

r.get('/public', worker.listWorkersPublic);
r.get('/public/:id', worker.publicValidators, validate, worker.getWorkerPublic);

r.get('/me', authenticate(), authorize('worker'), worker.getMyWorker);
r.patch('/me', authenticate(), authorize('worker'), worker.workerValidators.updateProfile, validate, worker.updateMyWorker);
r.get('/me/documents', authenticate(), authorize('worker'), worker.listMyDocuments);
r.post(
  '/me/documents',
  authenticate(),
  authorize('worker'),
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  worker.workerValidators.document,
  validate,
  worker.uploadDocument
);
r.get('/me/earnings', authenticate(), authorize('worker'), worker.myEarnings);

export default r;
