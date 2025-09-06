import jwt from 'jsonwebtoken';
import { JWT_ADMIN_SECRET } from '../config/jwtAdmin.js';

export const authenticateAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_ADMIN_SECRET, (err, admin) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.admin = admin;
    next();
  });
};
