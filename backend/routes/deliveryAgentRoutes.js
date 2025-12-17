import express from 'express';
import { authenticateAdminToken } from '../middlewares/authAdminMiddleware.js';
import {
  deliveryAgentSignup,
  deliveryAgentLogin,
  guestDeliveryAgentLogin,
  getAllDeliveryAgents,
  deleteDeliveryAgent,
  editDeliveryAgent
} from '../services/deliveryAgentService.js';

const router = express.Router();

// Signup, Login can remain public or restrict signup to admin if needed
router.post('/signup', authenticateAdminToken, async (req, res) => {
  try {
    const agentData = req.body;
    if (!agentData) {
      return res.status(400).json({ error: 'Request body is missing' });
    }
    const result = await deliveryAgentSignup(agentData);
    res.status(201).json({ message: 'Signup successful', agent: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const agent = await deliveryAgentLogin(email, password);
    res.json({ message: 'Login successful', agent });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/guest-login', async (req, res) => {
  try {
    const agent = await guestDeliveryAgentLogin();
    res.json({ message: 'Guest login successful', agent });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Protect following routes with admin auth
router.get('/', async (req, res) => {
  try {
    const agents = await getAllDeliveryAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateAdminToken, async (req, res) => {
  try {
    const result = await deleteDeliveryAgent(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticateAdminToken, async (req, res) => {
  try {
    const result = await editDeliveryAgent(req.params.id, req.body);
    res.json({ message: 'Delivery agent updated', agent: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
