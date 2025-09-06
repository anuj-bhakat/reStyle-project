import dotenv from 'dotenv';
dotenv.config();

export const JWT_AGENT_SECRET = process.env.JWT_AGENT_SECRET || 'defaultAgentSecret';
export const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d';
