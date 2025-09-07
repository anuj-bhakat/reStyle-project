import express from 'express';
import { authenticateAdminToken } from '../middlewares/authAdminMiddleware.js';
import { authenticateManagerToken } from '../middlewares/authManagerMiddleware.js';
import {
  signupManagerController,
  loginManagerController,
  editManagerController,
  deleteManagerController,
  getAllManagersController,
} from '../controllers/managerController.js';

const router = express.Router();

// Public route to get all managers (optional: protect if needed)
router.get('/', authenticateAdminToken, getAllManagersController);

// Signup protected by admin auth
router.post('/signup',authenticateAdminToken, signupManagerController);

// Login is public
router.post('/login', loginManagerController);

// Protect edit and delete by manager auth middleware
router.put('/:id', authenticateAdminToken, editManagerController);
router.delete('/:id', authenticateAdminToken, deleteManagerController);

export default router;
