import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db.js';

export const createManager = async (managerData) => {
  const { manager_id, name, email, password, phone } = managerData;

  if (!manager_id || !name || !email || !password || !phone) {
    throw new Error('Missing required fields');
  }

  const existingResult = await pool.query('SELECT * FROM managers WHERE email = $1', [email]);
  if (existingResult.rows.length > 0) {
    throw new Error('Manager with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuidv4();

  try {
    const result = await pool.query(
      'INSERT INTO managers (id, manager_id, name, email, password, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, manager_id, name, email, passwordHash, phone]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const managerLogin = async (manager_id, password) => {
  const result = await pool.query('SELECT * FROM managers WHERE manager_id = $1', [manager_id]);
  const data = result.rows[0];

  if (!data) {
    throw new Error('Invalid manager ID or password');
  }

  const validPass = await bcrypt.compare(password, data.password);
  if (!validPass) {
    throw new Error('Invalid manager ID or password');
  }

  return data;
};

export const guestManagerLogin = async () => {
  const guestManagerId = process.env.GUEST_MANAGER_ID;

  if (!guestManagerId) {
    throw new Error('Guest manager login is not configured');
  }

  const result = await pool.query('SELECT * FROM managers WHERE manager_id = $1', [guestManagerId]);
  const data = result.rows[0];

  if (!data) {
    throw new Error('Guest manager user not found');
  }

  return { ...data, isGuest: true };
};

export const updateManager = async (id, updateData) => {
  const updates = [];
  const values = [];
  let index = 1;

  if (updateData.name) {
    updates.push(`name = $${index++}`);
    values.push(updateData.name);
  }
  if (updateData.email) {
    updates.push(`email = $${index++}`);
    values.push(updateData.email);
  }
  if (updateData.phone) {
    updates.push(`phone = $${index++}`);
    values.push(updateData.phone);
  }
  if (updateData.password) {
    const hash = await bcrypt.hash(updateData.password, 10);
    updates.push(`password = $${index++}`);
    values.push(hash);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(id);
  const query = `UPDATE managers SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Manager not found for update');
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const deleteManager = async (id) => {
  try {
    const result = await pool.query('DELETE FROM managers WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      throw new Error('Manager not found');
    }
    return { message: 'Manager deleted successfully' };
  } catch (error) {
    throw error;
  }
};

export const fetchAllManagers = async () => {
  try {
    const result = await pool.query('SELECT id, manager_id, name, email, phone, created_at, updated_at FROM managers');
    return result.rows;
  } catch (error) {
    throw error;
  }
};