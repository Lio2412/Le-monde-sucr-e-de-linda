import { PrismaClient, User, Role, UserRole } from '@prisma/client';

declare global {
  type MockedUser = User & {
    roles: (UserRole & {
      role: Role;
    })[];
  };

  type PrismaTransaction = Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
  >;
} 