import { pool } from '../config/db.js';

// Create new pickup request
export const createPickupRequest = async (pickupData) => {
  const keys = Object.keys(pickupData);
  const values = Object.values(pickupData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  const query = `INSERT INTO pickup_requests (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update existing pickup request by id
export const updatePickupRequest = async (id, updateData) => {
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
  const query = `UPDATE pickup_requests SET ${updates.join(', ')} WHERE pickup_request_id = $${index} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Pickup request not found for update');
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const fetchPickupRequestsByDeliveryAgent = async (deliveryagent_id) => {
  try {
    const result = await pool.query('SELECT * FROM pickup_requests WHERE deliveryagent_id = $1', [deliveryagent_id]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const fetchPickupRequestsByListingId = async (listing_id) => {
  try {
    const result = await pool.query('SELECT * FROM pickup_requests WHERE listing_id = $1', [listing_id]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};