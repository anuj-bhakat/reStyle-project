import express from 'express';
import {
  createOrderController,
  updateOrderController,
  deleteOrderController,
  getOrderByIdController,
  getOrdersByCustomerController,
  getOrdersByStatusController,
  getOrdersByDeliveryAgentController,
} from '../controllers/customerOrderController.js';

const router = express.Router();

router.post('/', createOrderController);
router.put('/:id', updateOrderController);
router.delete('/:id', deleteOrderController);
router.get('/:id', getOrderByIdController);
router.get('/customer/:customer_id', getOrdersByCustomerController);
router.get('/agent/:deliveryagent_id', getOrdersByDeliveryAgentController);

router.get('/status/:status', getOrdersByStatusController);

export default router;
