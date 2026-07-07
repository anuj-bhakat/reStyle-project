import { pool } from '../config/db.js';

// Update order by UUID id
export const updateCustomerOrder = async (id, updateData) => {
  const updates = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(updateData)) {
    updates.push(`${key} = $${index++}`);
    values.push(value);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(id);
  const query = `UPDATE customer_orders SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Order not found');
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Delete order by UUID id
export const deleteCustomerOrder = async (id) => {
  try {
    const result = await pool.query('DELETE FROM customer_orders WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      throw new Error('Order not found');
    }
    return true;
  } catch (error) {
    throw error;
  }
};

// Fetch order by UUID id
export const fetchOrderById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM customer_orders WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new Error('Order not found');
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Fetch orders by customer_id
export const fetchOrdersByCustomerId = async (customer_id) => {
  try {
    const result = await pool.query('SELECT * FROM customer_orders WHERE customer_id = $1', [customer_id]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const generateOrderId = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return (
    'ORD' +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
};

// Create an order and mark its products as sold
export const createCustomerOrderAndMarkSold = async (orderData) => {
  orderData.order_id = generateOrderId();
  
  // orderData may contain fields like customer_id, products, total_price, status, payment_status, deliveryagent_id, other_charges
  const keys = Object.keys(orderData);
  const values = Object.values(orderData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertQuery = `INSERT INTO customer_orders (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await client.query(insertQuery, values);
    const newOrder = result.rows[0];

    const productIds = Object.keys(orderData.products || {});
    if (productIds.length > 0) {
      const updatePlaceholders = productIds.map((_, i) => `$${i + 1}`).join(', ');
      const updateQuery = `UPDATE product_listings SET status = 'sold' WHERE listing_id IN (${updatePlaceholders})`;
      await client.query(updateQuery, productIds);
    }

    await client.query('COMMIT');
    return newOrder;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const fetchOrdersByStatus = async (status) => {
  const allowedStatuses = ['ordered', 'delivering', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid status value');
  }

  try {
    const result = await pool.query('SELECT * FROM customer_orders WHERE status = $1', [status]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const fetchOrdersByDeliveryAgentId = async (deliveryagent_id) => {
  try {
    const result = await pool.query('SELECT * FROM customer_orders WHERE deliveryagent_id = $1', [deliveryagent_id]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};