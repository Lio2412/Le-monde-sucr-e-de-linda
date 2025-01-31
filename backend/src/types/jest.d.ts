import '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';

declare global {
  var prisma: PrismaClient | undefined;
  var prismaMock: DeepMockProxy<PrismaClient>;
  
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWith(expected: unknown): R;
    }
  }
} 