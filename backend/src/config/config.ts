import dotenv from 'dotenv';

dotenv.config();

interface Config {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV: 'development' | 'production' | 'test';
  CLIENT_URL: string;
}

const config: Config = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/le-monde-sucre',
  JWT_SECRET: process.env.JWT_SECRET || 'votre-secret-jwt',
  NODE_ENV: (process.env.NODE_ENV as Config['NODE_ENV']) || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
};

export default config; 