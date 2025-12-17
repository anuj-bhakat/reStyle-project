import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabaseClient.js';

export const createManager = async (managerData) => {
  const { manager_id, name, email, password, phone } = managerData;

  if (!manager_id || !name || !email || !password || !phone) {
    throw new Error('Missing required fields');
  }

  const { data: existingData } = await supabase
    .from('managers')
    .select('*')
    .eq('email', email)
    .single();

  if (existingData) {
    throw new Error('Manager with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuidv4();

  // Remove isAdmin check and property
  const { data, error } = await supabase.from('managers').insert([{
    id,
    manager_id,
    name,
    email,
    password: passwordHash,
    phone,
  }]).select();

  if (error) {
    throw error;
  }

  return data[0];
};


export const managerLogin = async (manager_id, password) => {
  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .eq('manager_id', manager_id)
    .single();

  if (error || !data) {
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

  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .eq('manager_id', guestManagerId)
    .single();

  if (error || !data) {
    throw new Error('Guest manager user not found');
  }

  return { ...data, isGuest: true };
};


export const updateManager = async (id, updateData) => {
  const updates = {};

  if (updateData.name) updates.name = updateData.name;
  if (updateData.email) updates.email = updateData.email;
  if (updateData.phone) updates.phone = updateData.phone;
  if (updateData.password) {
    updates.password = await bcrypt.hash(updateData.password, 10);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No fields to update');
  }

  const { data, error } = await supabase
    .from('managers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteManager = async (id) => {
  const { error } = await supabase
    .from('managers')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return { message: 'Manager deleted successfully' };
};


export const fetchAllManagers = async () => {
  const { data, error } = await supabase
    .from('managers')
    .select('id, manager_id, name, email, phone, created_at, updated_at');

  if (error) {
    throw error;
  }

  return data;
};