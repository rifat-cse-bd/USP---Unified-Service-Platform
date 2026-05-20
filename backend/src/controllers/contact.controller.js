import { body } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';

export const contactValidators = {
  create: [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('company').optional().trim(),
    body('message').trim().notEmpty(),
  ],
};

export const createContact = asyncHandler(async (req, res) => {
  const { name, email, company, message } = req.body;

  // In a real app, you'd send an email or save to database
  // For now, just log it and return success
  console.log('Contact form submission:', { name, email, company, message });

  res.status(201).json({
    success: true,
    message: 'Thank you for your message. We\'ll get back to you soon!'
  });
});