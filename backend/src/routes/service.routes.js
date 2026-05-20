import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import * as svc from '../controllers/service.controller.js';

const r = Router();

r.get('/categories', svc.listCategories);
r.get('/search/suggestions', svc.searchSuggestions);
r.get('/recommendations', authenticate({ optional: true }), svc.recommendations);
r.get('/', svc.listServices);
r.get('/:id', svc.idParam, validate, svc.getService);

r.post('/', authenticate(), authorize('worker'), svc.serviceValidators.create, validate, svc.createService);
r.patch('/:id', authenticate(), authorize('worker'), svc.idParam, svc.serviceValidators.update, validate, svc.updateService);
r.delete('/:id', authenticate(), authorize('worker'), svc.idParam, validate, svc.deleteService);
r.post(
  '/:id/images',
  authenticate(),
  authorize('worker'),
  svc.idParam,
  validate,
  upload.array('images', 8),
  svc.uploadServiceImages
);

export default r;
