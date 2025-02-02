import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock de Prisma
export const prismaMock = mockDeep<PrismaClient>();

jest.mock('../config/database', () => ({
  prisma: prismaMock
}));

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_token'),
  verify: jest.fn().mockReturnValue({ userId: 'mock_user_id' })
}));

// Mock des constantes
jest.mock('../config/constants', () => ({
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '1h',
  BCRYPT_SALT_ROUNDS: 10,
  NODE_ENV: 'test'
}));

beforeEach(() => {
  mockReset(prismaMock);
  jest.clearAllMocks();
});