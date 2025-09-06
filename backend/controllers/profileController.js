import { supabase } from '../config/supabaseClient.js';
import { updateAddress } from '../services/authService.js';
import { updateProfile } from '../services/authService.js';
import { changePassword } from '../services/authService.js';

export const profileController = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, gender, phone, address')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: data });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateAddressController = async (req, res) => {
  try {
    const userId = req.params.id;
    const addressData = req.body;
    console.log(addressData);

    const result = await updateAddress(userId, addressData);

    res.status(200).json(result);
  } catch (error) {
    console.error('Address update error:', error);
    res.status(400).json({ error: error.message || 'Failed to update address' });
  }
};


export const updateProfileController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Authorization check
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const profileData = req.body;
    const updatedProfile = await updateProfile(userId, profileData);

    res.json({ message: 'Profile updated successfully', user: updatedProfile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ error: error.message || 'Failed to update profile' });
  }
};


export const changePasswordController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Authorization: ensure user can only change own password
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to change this password' });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    const result = await changePassword(userId, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({ error: error.message || 'Failed to change password' });
  }
};
