import jwt from 'jsonwebtoken';
import { JWT_MANAGER_SECRET } from '../config/jwtManager.js';

export const authenticateManagerToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_MANAGER_SECRET, (err, manager) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.manager = manager;
    next();
  });
};
