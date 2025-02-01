import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = '1d';

// Server Configuration
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Database Configuration
export const DATABASE_URL = process.env.DATABASE_URL;

// Security Configuration
export const BCRYPT_SALT_ROUNDS = 10;
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window

// Performance Thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  LOGIN: 500,
  REGISTER: 800,
  GET_ME: 200,
  DEFAULT: 1000
}; 