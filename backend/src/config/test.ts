import { config } from 'dotenv';
import path from 'path';

// Charger les variables d'environnement de test
config({ path: '.env.test' });

export const testConfig = {
  port: process.env.PORT || 5001,
  jwtSecret: process.env.JWT_SECRET || 'test_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  uploadDir: process.env.UPLOAD_DIR || 'uploads/test',
  databaseUrl: process.env.DATABASE_URL
}; 