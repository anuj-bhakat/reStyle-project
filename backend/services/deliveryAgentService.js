import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { JWT_AGENT_SECRET, TOKEN_EXPIRY } from '../config/jwtAgentConfig.js';

// Signup: create new delivery agent with hashed password and agentid
export const deliveryAgentSignup = async (agentData) => {
  const { email, password, agentid } = agentData;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const hashpassword = await bcrypt.hash(password, 10);
  const deliveryagent_id = uuidv4();

  try {
    const result = await pool.query(
      'INSERT INTO delivery_agents (deliveryagent_id, email, hashpassword, agentid) VALUES ($1, $2, $3, $4) RETURNING *',
      [deliveryagent_id, email, hashpassword, agentid]
    );

    if (result.rows.length === 0) {
      throw new Error('Signup failed');
    }

    const newAgent = result.rows[0];
    return {
      deliveryagent_id: newAgent.deliveryagent_id,
      email: newAgent.email,
      agentid: newAgent.agentid,
      created_at: newAgent.created_at,
    };
  } catch (error) {
    throw error;
  }
};

// Login: validate email & password
export const deliveryAgentLogin = async (email, password) => {
  const result = await pool.query(
    'SELECT deliveryagent_id, email, hashpassword, agentid FROM delivery_agents WHERE email = $1',
    [email]
  );
  const data = result.rows[0];

  if (!data) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, data.hashpassword);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  // Create JWT payload
  const payload = {
    deliveryagent_id: data.deliveryagent_id,
    email: data.email,
    agentid: data.agentid,
  };

  // Sign JWT token
  const token = jwt.sign(payload, JWT_AGENT_SECRET, { expiresIn: TOKEN_EXPIRY });

  return {
    deliveryagent_id: data.deliveryagent_id,
    email: data.email,
    agentid: data.agentid,
    deliveryAgentToken: token,
  };
};

// Guest Login
export const guestDeliveryAgentLogin = async () => {
  const guestAgentEmail = process.env.GUEST_DELIVERY_AGENT_EMAIL;

  if (!guestAgentEmail) {
    console.error('GUEST_DELIVERY_AGENT_EMAIL is missing in .env');
    throw new Error('Guest delivery agent login is not configured');
  }

  const result = await pool.query(
    'SELECT deliveryagent_id, email, agentid FROM delivery_agents WHERE email = $1',
    [guestAgentEmail]
  );
  const data = result.rows[0];

  if (!data) {
    throw new Error('Guest delivery agent user not found');
  }

  // Create JWT payload with isGuest flag
  const payload = {
    deliveryagent_id: data.deliveryagent_id,
    email: data.email,
    agentid: data.agentid,
    isGuest: true
  };

  const token = jwt.sign(payload, JWT_AGENT_SECRET, { expiresIn: TOKEN_EXPIRY });

  return {
    deliveryagent_id: data.deliveryagent_id,
    email: data.email,
    agentid: data.agentid,
    deliveryAgentToken: token,
    isGuest: true
  };
};

// Get all delivery agents with lowercase agentid
export const getAllDeliveryAgents = async () => {
  try {
    const result = await pool.query('SELECT deliveryagent_id, email, agentid, created_at FROM delivery_agents ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Delete delivery agent by ID
export const deleteDeliveryAgent = async (id) => {
  try {
    await pool.query('DELETE FROM delivery_agents WHERE deliveryagent_id = $1', [id]);
    return { message: 'Delivery agent deleted successfully' };
  } catch (error) {
    throw error;
  }
};

// Edit delivery agent (email, password, agentid)
export const editDeliveryAgent = async (id, updateData) => {
  const updates = [];
  const values = [];
  let index = 1;

  if (updateData.email) {
    updates.push(`email = $${index++}`);
    values.push(updateData.email);
  }

  if (updateData.password) {
    const hashpassword = await bcrypt.hash(updateData.password, 10);
    updates.push(`hashpassword = $${index++}`);
    values.push(hashpassword);
  }

  if (updateData.agentid !== undefined) {
    updates.push(`agentid = $${index++}`);
    values.push(updateData.agentid);
  }

  if (updates.length === 0) {
    throw new Error('No updates provided');
  }

  values.push(id);
  const query = `UPDATE delivery_agents SET ${updates.join(', ')} WHERE deliveryagent_id = $${index} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Delivery agent not found for update');
    }
    
    const data = result.rows[0];
    return {
      deliveryagent_id: data.deliveryagent_id,
      email: data.email,
      agentid: data.agentid,
    };
  } catch (error) {
    throw error;
  }
};
