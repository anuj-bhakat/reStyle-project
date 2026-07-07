import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db.js';

export const createAdmin = async (adminData) => {
  const { username, email, password } = adminData;
  if (!username || !email || !password) {
    throw new Error('Missing required fields');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin_id = uuidv4();

  try {
    const result = await pool.query(
      'INSERT INTO admins (admin_id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [admin_id, username, email, passwordHash]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const adminLogin = async (username, password) => {
  const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
  const data = result.rows[0];

  if (!data) {
    throw new Error('Invalid username or password');
  }

  const validPass = await bcrypt.compare(password, data.password);
  if (!validPass) {
    throw new Error('Invalid username or password');
  }

  return data;
};

export const guestAdminLogin = async () => {
  const guestUsername = process.env.GUEST_ADMIN_USERNAME;

  if (!guestUsername) {
    throw new Error('Guest admin login is not configured');
  }

  const result = await pool.query('SELECT * FROM admins WHERE username = $1', [guestUsername]);
  const data = result.rows[0];

  if (!data) {
    throw new Error('Guest admin user not found');
  }

  return { ...data, isGuest: true };
};

export const updateAdmin = async (admin_id, updateData) => {
  const updates = [];
  const values = [];
  let index = 1;

  if (updateData.email) {
    updates.push(`email = $${index++}`);
    values.push(updateData.email);
  }
  if (updateData.username) {
    updates.push(`username = $${index++}`);
    values.push(updateData.username);
  }
  if (updateData.password) {
    const hash = await bcrypt.hash(updateData.password, 10);
    updates.push(`password = $${index++}`);
    values.push(hash);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(admin_id);
  const query = `UPDATE admins SET ${updates.join(', ')} WHERE admin_id = $${index} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Admin not found');
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};
