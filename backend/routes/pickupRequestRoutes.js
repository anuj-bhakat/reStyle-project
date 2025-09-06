import express from 'express';
import {
  createPickupRequestController,
  getPickupRequestsByDeliveryAgentController,
  getPickupRequestsByListingIdController,
  updatePickupRequestController,
} from '../controllers/pickupRequestController.js';

const router = express.Router();

router.post('/create', createPickupRequestController);
router.get('/listing/:listing_id', getPickupRequestsByListingIdController);

router.put('/:id', updatePickupRequestController);
router.get('/get/:deliveryagent_id', getPickupRequestsByDeliveryAgentController);

export default router;
