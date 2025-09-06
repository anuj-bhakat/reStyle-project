import {
  updateCustomerOrder,
  deleteCustomerOrder,
  fetchOrderById,
  fetchOrdersByCustomerId,
  createCustomerOrderAndMarkSold,
} from '../services/customerOrderService.js';

// POST /customer_orders
export const createOrderController = async (req, res) => {
  try {
    const orderData = req.body;
    const requiredFields = ['customer_id', 'products', 'total_price', 'status', 'payment_status'];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const newOrder = await createCustomerOrderAndMarkSold(orderData);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// PUT /customer_orders/:id
export const updateOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const updateData = req.body;
    const updatedOrder = await updateCustomerOrder(id, updateData);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /customer_orders/:id
export const deleteOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'id is required' });
    await deleteCustomerOrder(id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /customer_orders/:id
export const getOrderByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const order = await fetchOrderById(id);
    res.json(order);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// GET /customer_orders/customer/:customer_id
export const getOrdersByCustomerController = async (req, res) => {
  try {
    const { customer_id } = req.params;
    if (!customer_id) return res.status(400).json({ error: 'customer_id is required' });
    const orders = await fetchOrdersByCustomerId(customer_id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
