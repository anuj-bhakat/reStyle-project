import jwt from 'jsonwebtoken';
import { JWT_ADMIN_SECRET, TOKEN_EXPIRY } from '../config/jwtAdmin.js';
import { createAdmin, adminLogin, updateAdmin, guestAdminLogin } from '../services/adminService.js';

export const signupAdminController = async (req, res) => {
  try {
    const newAdmin = await createAdmin(req.body);
    res.status(201).json({ message: 'Admin created', admin: { admin_id: newAdmin.admin_id, username: newAdmin.username, email: newAdmin.email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const loginAdminController = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const admin = await adminLogin(username, password);

    // Create token payload (avoid including sensitive password)
    const payload = { adminId: admin.admin_id, username: admin.username };

    const token = jwt.sign(payload, JWT_ADMIN_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.json({ message: 'Login successful', adminToken: token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const guestLoginAdminController = async (req, res) => {
  try {
    const admin = await guestAdminLogin();

    // Create token payload
    const payload = {
      adminId: admin.admin_id,
      username: admin.username,
      isGuest: true
    };

    const token = jwt.sign(payload, JWT_ADMIN_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.json({
      message: 'Guest login successful',
      adminToken: token,
      isGuest: true,
      admin: {
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};



export const editAdminController = async (req, res) => {
  try {
    const adminId = req.params.admin_id;
    const updateData = req.body;

    // Optional: authorize user via middleware or token comparison here

    const updatedAdmin = await updateAdmin(adminId, updateData);

    res.json({ message: 'Admin updated', admin: { admin_id: updatedAdmin.admin_id, username: updatedAdmin.username, email: updatedAdmin.email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
