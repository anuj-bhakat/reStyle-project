import jwt from 'jsonwebtoken';
import { JWT_MANAGER_SECRET, TOKEN_EXPIRY } from '../config/jwtManager.js';
import { createManager, managerLogin, updateManager, deleteManager } from '../services/managerService.js';
import { fetchAllManagers } from '../services/managerService.js';

export const getAllManagersController = async (req, res) => {
  try {
    const managers = await fetchAllManagers();
    res.json(managers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const signupManagerController = async (req, res) => {
  try {
    const managerData = req.body;
    const newManager = await createManager(managerData);

    res.status(201).json({
      message: 'Manager created',
      manager: {
        id: newManager.id,
        manager_id: newManager.manager_id,
        name: newManager.name,
        email: newManager.email,
        phone: newManager.phone,
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const loginManagerController = async (req, res) => {
  try {
    const { manager_id, password } = req.body;
    if (!manager_id || !password) {
      return res.status(400).json({ error: 'Manager ID and password required' });
    }

    const manager = await managerLogin(manager_id, password);

    const payload = { id: manager.id, manager_id: manager.manager_id };
    const token = jwt.sign(payload, JWT_MANAGER_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.json({ message: 'Login successful', managerToken: token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};


export const editManagerController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedManager = await updateManager(id, updateData);
    res.json({
      message: 'Manager updated',
      manager: {
        id: updatedManager.id,
        manager_id: updatedManager.manager_id,
        name: updatedManager.name,
        email: updatedManager.email,
        phone: updatedManager.phone,
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteManagerController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteManager(id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
