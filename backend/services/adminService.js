import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabaseClient.js';

export const createAdmin = async (adminData) => {
  const { username, email, password } = adminData;
  if (!username || !email || !password) {
    throw new Error('Missing required fields');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin_id = uuidv4();

  const { data, error } = await supabase.from('admins').insert([
    {
      admin_id,
      username,
      email,
      password: passwordHash,
    },
  ]).select();

  if (error) {
    throw error;
  }
  return data[0];
};

export const adminLogin = async (username, password) => {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) {
    throw new Error('Invalid username or password');
  }

  const validPass = await bcrypt.compare(password, data.password);
  if (!validPass) {
    throw new Error('Invalid username or password');
  }

  return data; // return admin record for token generation
};

export const guestAdminLogin = async () => {
  const guestUsername = process.env.GUEST_ADMIN_USERNAME;

  if (!guestUsername) {
    throw new Error('Guest admin login is not configured');
  }

  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', guestUsername)
    .single();

  if (error || !data) {
    throw new Error('Guest admin user not found');
  }

  return { ...data, isGuest: true };
};



export const updateAdmin = async (admin_id, updateData) => {
  const updates = {};

  if (updateData.email) updates.email = updateData.email;
  if (updateData.username) updates.username = updateData.username;
  if (updateData.password) {
    updates.password = await bcrypt.hash(updateData.password, 10);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No fields to update');
  }

  const { data, error } = await supabase
    .from('admins')
    .update(updates)
    .eq('admin_id', admin_id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
