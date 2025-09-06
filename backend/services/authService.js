import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';
import { JWT_SECRET } from '../config/jwt.js';
import { v4 as uuidv4 } from 'uuid';

export const signup = async (userData) => {
  const { first_name, last_name, email, gender, phone, password } = userData;

  if (!first_name || !last_name || !email || !password || !gender) {
    throw new Error('Missing required fields');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuidv4();

  const { data, error } = await supabase.from('profiles').insert([
    {
      id,
      first_name,
      last_name,
      email,
      gender,
      phone,
      password_hash: passwordHash,
      address: null,
    },
  ]).select();

  if (error) {
    throw error;
  }

  return { id, email: data[0].email };
};

export const login = async (email, password) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, password_hash')
    .eq('email', email)
    .single();

  if (error || !data) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, data.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ userId: data.id, email: data.email }, JWT_SECRET, {
    expiresIn: '2h',
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

export const updateAddress = async (userId, addressData) => {
  const { phone, plot, colony, city, country } = addressData;

  const address = {
    plot,
    colony,
    city,
    country,
  };

  const { error } = await supabase
    .from('profiles')
    .update({
      phone,
      address,
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }

  return { message: 'Address updated successfully' };
};


export const updateProfile = async (userId, profileData) => {
  // Allowed editable fields
  const editableFields = ['first_name', 'last_name', 'phone', 'gender', 'email', 'address'];

  const updates = {};

  editableFields.forEach(field => {
    if (profileData[field] !== undefined) {
      // For address, ensure it's an object (or null) before including
      if (field === 'address') {
        if (typeof profileData.address === 'object' || profileData.address === null) {
          updates.address = profileData.address;
        } else {
          throw new Error('Address must be an object or null');
        }
      } else {
        updates[field] = profileData[field];
      }
    }
  });

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('Failed to update profile');
  }

  return data;
};



export const changePassword = async (userId, oldPassword, newPassword) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, data.password_hash);
  if (!isMatch) {
    throw new Error('Old password is incorrect');
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ password_hash: newHash })
    .eq('id', userId);

  if (updateError) {
    throw updateError;
  }

  return { message: 'Password changed successfully' };
};