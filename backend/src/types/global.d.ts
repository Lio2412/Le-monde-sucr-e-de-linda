import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';

declare global {
  var prisma: DeepMockProxy<PrismaClient> | undefined;
  
  namespace NodeJS {
    interface Global {
      prisma: DeepMockProxy<PrismaClient>;
    }
  }
} 