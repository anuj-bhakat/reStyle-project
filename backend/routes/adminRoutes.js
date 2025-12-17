import express from 'express';
import { signupAdminController, loginAdminController, editAdminController, guestLoginAdminController } from '../controllers/adminController.js';
import { authenticateAdminToken } from '../middlewares/authAdminMiddleware.js';

const router = express.Router();

router.post('/signup', signupAdminController);
router.post('/login', loginAdminController);
router.post('/guest-login', guestLoginAdminController);

router.put('/:admin_id', authenticateAdminToken, editAdminController);

export default router;
