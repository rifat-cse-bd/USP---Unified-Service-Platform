import { Router } from 'express';
import { createContact, contactValidators } from '../controllers/contact.controller.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.post('/', contactValidators.create, validate, createContact);

export default router;