import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Server
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Database
export const DATABASE_URL = process.env.DATABASE_URL; 