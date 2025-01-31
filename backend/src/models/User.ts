import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string;
}

export const userModel = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email }
    });
  },
  
  create: async (data: CreateUserInput) => {
    return prisma.user.create({
      data
    });
  },
  
  update: async (id: string, data: UpdateUserInput) => {
    return prisma.user.update({
      where: { id },
      data
    });
  },
  
  delete: async (id: string) => {
    return prisma.user.delete({
      where: { id }
    });
  },
  
  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id }
    });
  }
};

export default prisma; 