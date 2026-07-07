import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { JWT_SECRET } from '../config/jwt.js';
import { v4 as uuidv4 } from 'uuid';

export const signup = async (userData) => {
  const { first_name, last_name, email, gender, phone, password } = userData;

  if (!first_name || !last_name || !email || !password || !gender) {
    throw new Error('Missing required fields');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuidv4();

  try {
    const result = await pool.query(
      'INSERT INTO profiles (id, first_name, last_name, email, gender, phone, password_hash, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, first_name, last_name, email, gender, phone, passwordHash, null]
    );
    return { id, email: result.rows[0].email };
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  const result = await pool.query(
    'SELECT id, first_name, last_name, email, password_hash FROM profiles WHERE email = $1',
    [email]
  );
  const data = result.rows[0];

  if (!data) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, data.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ userId: data.id, email: data.email }, JWT_SECRET, {
    expiresIn: '10h',
  });

  return {
    token,
    user: {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
    },
  };
};

export const guestLogin = async () => {
  const guestEmail = process.env.GUEST_EMAIL;

  if (!guestEmail) {
    throw new Error('Guest login is not configured');
  }

  const result = await pool.query(
    'SELECT id, first_name, last_name, email FROM profiles WHERE email = $1',
    [guestEmail]
  );
  const data = result.rows[0];

  if (!data) {
    throw new Error('Guest user not found');
  }

  const token = jwt.sign({ userId: data.id, email: data.email }, JWT_SECRET, {
    expiresIn: '10h',
  });

  return {
    token,
    user: {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
    },
    isGuest: true
  };
};

export const updateAddress = async (userId, addressData) => {
  const { phone, plot, colony, city, country } = addressData;

  const address = {
    plot,
    colony,
    city,
    country,
  };

  try {
    const result = await pool.query(
      'UPDATE profiles SET phone = $1, address = $2 WHERE id = $3 RETURNING *',
      [phone, address, userId]
    );
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    return { message: 'Address updated successfully' };
  } catch (error) {
    throw error;
  }
};


export const updateProfile = async (userId, profileData) => {
  const editableFields = ['first_name', 'last_name', 'phone', 'gender', 'email', 'address'];

  const updates = [];
  const values = [];
  let index = 1;

  editableFields.forEach(field => {
    if (profileData[field] !== undefined) {
      if (field === 'address') {
        if (typeof profileData.address === 'object' || profileData.address === null) {
          updates.push(`address = $${index++}`);
          values.push(profileData.address);
        } else {
          throw new Error('Address must be an object or null');
        }
      } else {
        updates.push(`${field} = $${index++}`);
        values.push(profileData[field]);
      }
    }
  });

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(userId);
  const query = `UPDATE profiles SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Failed to update profile');
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};



export const changePassword = async (userId, oldPassword, newPassword) => {
  const result = await pool.query(
    'SELECT password_hash FROM profiles WHERE id = $1',
    [userId]
  );
  const data = result.rows[0];

  if (!data) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, data.password_hash);
  if (!isMatch) {
    throw new Error('Old password is incorrect');
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  try {
    await pool.query(
      'UPDATE profiles SET password_hash = $1 WHERE id = $2',
      [newHash, userId]
    );
    return { message: 'Password changed successfully' };
  } catch (updateError) {
    throw updateError;
  }
};