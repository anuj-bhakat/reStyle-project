import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';
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

  const { data, error } = await supabase.from('delivery_agents').insert([
    {
      deliveryagent_id,
      email,
      hashpassword,
      agentid,   // use lowercase agentid here
    },
  ]).select();

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Signup failed');
  }

  return {
    deliveryagent_id: data[0].deliveryagent_id,
    email: data[0].email,
    agentid: data[0].agentid,    // reflect lowercase
    created_at: data[0].created_at,
  };
};




// Login: validate email & password
export const deliveryAgentLogin = async (email, password) => {
  const { data, error } = await supabase
    .from('delivery_agents')
    .select('deliveryagent_id, email, hashpassword, agentid')
    .eq('email', email)
    .single();

  if (error || !data) {
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

// Get all delivery agents with lowercase agentid
export const getAllDeliveryAgents = async () => {
  const { data, error } = await supabase
    .from('delivery_agents')
    .select('deliveryagent_id, email, agentid, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Delete delivery agent by ID
export const deleteDeliveryAgent = async (id) => {
  const { error } = await supabase
    .from('delivery_agents')
    .delete()
    .eq('deliveryagent_id', id);

  if (error) {
    throw error;
  }

  return { message: 'Delivery agent deleted successfully' };
};

// Edit delivery agent (email, password, agentid)
export const editDeliveryAgent = async (id, updateData) => {
  const updates = {};

  if (updateData.email) {
    updates.email = updateData.email;
  }

  if (updateData.password) {
    updates.hashpassword = await bcrypt.hash(updateData.password, 10);
  }

  if (updateData.agentid !== undefined) {
    updates.agentid = updateData.agentid;   // lowercase agentid
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No updates provided');
  }

  const { data, error } = await supabase
    .from('delivery_agents')
    .update(updates)
    .eq('deliveryagent_id', id)
    .select();

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Delivery agent not found for update');
  }

  return {
    deliveryagent_id: data[0].deliveryagent_id,
    email: data[0].email,
    agentid: data[0].agentid,
  };
};
