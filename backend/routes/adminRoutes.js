import express from 'express';
import { signupAdminController, loginAdminController, editAdminController } from '../controllers/adminController.js';
import { authenticateAdminToken } from '../middlewares/authAdminMiddleware.js';

const router = express.Router();

router.post('/signup', signupAdminController);
router.post('/login', loginAdminController);
router.put('/:admin_id', authenticateAdminToken, editAdminController);

export default router;
