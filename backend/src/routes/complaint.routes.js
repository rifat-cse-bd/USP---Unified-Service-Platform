import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as c from '../controllers/complaint.controller.js';

const r = Router();

r.post('/', authenticate(), c.complaintValidators.create, validate, c.createComplaint);
r.get('/mine', authenticate(), c.myComplaints);

export default r;
