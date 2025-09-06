import dotenv from 'dotenv';
dotenv.config();

export const JWT_MANAGER_SECRET = process.env.JWT_MANAGER_SECRET || 'defaultManagerSecret';
export const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d';