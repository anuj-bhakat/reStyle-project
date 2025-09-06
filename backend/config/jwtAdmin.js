import dotenv from 'dotenv';
dotenv.config();

export const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || 'defaultAdminSecret';
export const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d';
