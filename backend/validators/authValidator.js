import { body } from 'express-validator';

export const signupValidationRules = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('gender').notEmpty().withMessage('Gender is required'),
  body('password').isLength({ min: 6 }).withMessage('Password min length is 6'),
];

export const loginValidationRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
