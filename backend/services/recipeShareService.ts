import { prisma } from '../lib/prisma';
import type { RecipeShare } from '../../node_modules/.prisma/client';

export interface CreateRecipeShareData {
  recipeId: string;
  imageUrl?: string | null;
  comment?: string | null;
  userId?: string | null;
}

export class RecipeShareService {
  static async create(data: CreateRecipeShareData): Promise<RecipeShare> {
    return prisma.recipeShare.create({
      data: {
        recipeId: data.recipeId,
        imageUrl: data.imageUrl,
        comment: data.comment,
        userId: data.userId,
      },
    });
  }

  static async getByRecipeId(recipeId: string): Promise<RecipeShare[]> {
    return prisma.recipeShare.findMany({
      where: {
        recipeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
  }

  static async getById(id: string): Promise<RecipeShare | null> {
    return prisma.recipeShare.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        recipe: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.recipeShare.delete({
      where: {
        id,
      },
    });
  }

  static async getLatest(limit: number = 10): Promise<RecipeShare[]> {
    return prisma.recipeShare.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        recipe: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  static async getByUserId(userId: string): Promise<RecipeShare[]> {
    return prisma.recipeShare.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        recipe: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });
  }
} 