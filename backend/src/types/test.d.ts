import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';

declare global {
  var prisma: DeepMockProxy<PrismaClient>;
  
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWith(expected: unknown): R;
      toHaveBeenCalledTimes(expected: number): R;
      toHaveProperty(property: string, value?: unknown): R;
    }
  }
} 