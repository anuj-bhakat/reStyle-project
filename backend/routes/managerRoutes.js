import express from 'express';
import { authenticateAdminToken } from '../middlewares/authAdminMiddleware.js';
import {
  signupManagerController,
  loginManagerController,
  editManagerController,
  deleteManagerController,
  getAllManagersController,
} from '../controllers/managerController.js';


const router = express.Router();

router.get('/', getAllManagersController);
router.post('/signup', authenticateAdminToken, signupManagerController);

router.post('/login', loginManagerController);
router.put('/:id', editManagerController);
router.delete('/:id', deleteManagerController);

export default router;
