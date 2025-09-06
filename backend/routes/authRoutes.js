import express from 'express';
import { signupController, loginController } from '../controllers/authController.js';
import { signupValidationRules, loginValidationRules } from '../validators/authValidator.js';
import { validateRequest } from '../middlewares/validateMiddleware.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupValidationRules, validateRequest, signupController);
router.post('/login', loginValidationRules, validateRequest, loginController);

export default router;
