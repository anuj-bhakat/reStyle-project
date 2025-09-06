import express from 'express';
import {
  createOrderController,
  updateOrderController,
  deleteOrderController,
  getOrderByIdController,
  getOrdersByCustomerController,
} from '../controllers/customerOrderController.js';

const router = express.Router();

router.post('/', createOrderController);
router.put('/:id', updateOrderController);
router.delete('/:id', deleteOrderController);
router.get('/:id', getOrderByIdController);
router.get('/customer/:customer_id', getOrdersByCustomerController);

export default router;
