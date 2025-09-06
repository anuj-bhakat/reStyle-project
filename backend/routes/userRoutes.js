import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
  profileController,
  updateAddressController,
  updateProfileController,
  changePasswordController,
} from '../controllers/profileController.js';

const router = express.Router();

router.get('/profile', authenticateToken, profileController);

router.put('/:id/address', authenticateToken, (req, res, next) => {
  // Authorization check: user can update only their own address
  if (req.user.userId !== req.params.id) {
    return res.status(403).json({ error: 'Unauthorized to update this address' });
  }
  next();
}, updateAddressController);

// New route to update profile
router.put('/:id/profile', authenticateToken, updateProfileController);
router.put('/:id/change-password', authenticateToken, changePasswordController);

export default router;