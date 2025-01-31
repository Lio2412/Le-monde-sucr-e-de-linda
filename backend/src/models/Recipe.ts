import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateRecipeInput {
  title: string;
  slug: string;
  description: string;
  mainImage?: string;
  preparationTime: number;
  cookingTime: number;
  difficulty: string;
  servings: number;
  category: string;
  authorId: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  steps: {
    order: number;
    description: string;
    duration: number;
    image?: string;
  }[];
  tags: string[];
}

export interface UpdateRecipeInput {
  title?: string;
  description?: string;
  mainImage?: string;
  preparationTime?: number;
  cookingTime?: number;
  difficulty?: string;
  servings?: number;
  category?: string;
  ingredients?: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  steps?: {
    order: number;
    description: string;
    duration: number;
    image?: string;
  }[];
  tags?: string[];
}

export const recipeModel = {
  findBySlug: async (slug: string) => {
    return prisma.recipe.findUnique({
      where: { slug },
      include: {
        author: true,
        ingredients: true,
        steps: true,
        ratings: true,
        comments: true,
        shares: true
      }
    });
  },
  
  create: async (data: CreateRecipeInput) => {
    return prisma.recipe.create({
      data: {
        ...data,
        ingredients: {
          create: data.ingredients
        },
        steps: {
          create: data.steps
        }
      },
      include: {
        ingredients: true,
        steps: true
      }
    });
  },
  
  update: async (id: string, data: UpdateRecipeInput) => {
    return prisma.recipe.update({
      where: { id },
      data: {
        ...data,
        ingredients: data.ingredients ? {
          deleteMany: {},
          create: data.ingredients
        } : undefined,
        steps: data.steps ? {
          deleteMany: {},
          create: data.steps
        } : undefined
      },
      include: {
        ingredients: true,
        steps: true
      }
    });
  },
  
  delete: async (id: string) => {
    return prisma.recipe.delete({
      where: { id }
    });
  },
  
  findAll: async (options: Prisma.RecipeFindManyArgs = {}) => {
    return prisma.recipe.findMany({
      ...options,
      include: {
        author: true,
        ingredients: true,
        steps: true,
        ratings: true,
        comments: true,
        shares: true
      }
    });
  }
};

export default prisma; 