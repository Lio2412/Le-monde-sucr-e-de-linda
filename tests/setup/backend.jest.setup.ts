import '@testing-library/jest-dom';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock de PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

// Mock global pour prisma
export type Context = {
  prisma: PrismaClient;
};

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = () => ({
  prisma: mockDeep<PrismaClient>(),
});

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext() as MockContext;
  ctx = mockCtx as unknown as Context;
});

afterEach(() => {
  mockReset(mockCtx.prisma);
});

// Configuration globale pour les tests
beforeAll(() => {
  // Vérifier que nous sommes bien en environnement de test
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must be run in test environment');
  }

  // Configuration des timeouts globaux
  jest.setTimeout(10000);

  // Configuration des mocks
  jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn().mockResolvedValue(true),
    genSalt: jest.fn().mockResolvedValue('salt'),
  }));

// Nettoyage après tous les tests
afterAll(async () => {
  // Fermer toutes les connexions
  await ctx.prisma.$disconnect();
});

// Exporter le contexte mock pour utilisation dans les tests
export { mockCtx, ctx };

// Reset les mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

// Désactiver les logs pendant les tests
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn(); 