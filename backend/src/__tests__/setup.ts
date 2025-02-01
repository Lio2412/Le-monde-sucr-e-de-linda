import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn()
}));

const prismaMock = mockDeep<PrismaClient>();
const PrismaMock = PrismaClient as jest.Mock;
PrismaMock.mockImplementation(() => prismaMock);

beforeEach(() => {
  mockReset(prismaMock);
});

export { prismaMock as prisma }; 