import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../errors/ValidationError.js';
import { cacheService } from './cacheService.js';
import {
  RecipeWithRelations,
  CreateRecipeInput,
  UpdateRecipeInput,
  PaginationParams,
  PaginatedResponse
} from '../types/recipe.js';

export class RecipeService {
  constructor(private prisma: PrismaClient) {}

  async getAllRecipes(params?: PaginationParams): Promise<PaginatedResponse<RecipeWithRelations>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;

    if (page < 1) {
      throw new ValidationError('La page doit être ≥ 1');
    }

    if (limit < 1 || limit > 50) {
      throw new ValidationError('La limite doit être entre 1 et 50');
    }

    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          ingredients: true,
          steps: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.recipe.count(),
    ]);

    return {
      items: recipes as unknown as RecipeWithRelations[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRecipeById(id: string): Promise<RecipeWithRelations | null> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        ingredients: true,
        steps: true,
      },
    });

    return recipe as unknown as RecipeWithRelations | null;
  }

  async getRecipeBySlug(slug: string): Promise<RecipeWithRelations | null> {
    // Vérifier d'abord le cache
    const cachedRecipe = await cacheService.getRecipe(slug);
    if (cachedRecipe) {
      return cachedRecipe as RecipeWithRelations;
    }

    const recipe = await this.prisma.recipe.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        ingredients: true,
        steps: true
      }
    });

    if (recipe) {
      // Mettre en cache pour les futures requêtes
      await cacheService.setRecipe(slug, recipe);
    }

    return recipe as unknown as RecipeWithRelations | null;
  }

  async createRecipe(recipeData: CreateRecipeInput, userId: string): Promise<RecipeWithRelations> {
    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { slug: recipeData.slug }
    });

    if (existingRecipe) {
      throw new ValidationError('Une recette avec ce slug existe déjà');
    }

    const recipe = await this.prisma.recipe.create({
      data: {
        ...recipeData,
        authorId: userId,
        ingredients: {
          create: recipeData.ingredients
        },
        steps: {
          create: recipeData.steps
        }
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        ingredients: true,
        steps: true
      }
    });

    return recipe as unknown as RecipeWithRelations;
  }

  async updateRecipe(slug: string, recipeData: UpdateRecipeInput): Promise<RecipeWithRelations> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { slug }
    });

    if (!recipe) {
      throw new ValidationError('Recette non trouvée');
    }

    const updatedRecipe = await this.prisma.recipe.update({
      where: { slug },
      data: {
        ...recipeData,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        ingredients: true,
        steps: true
      }
    });

    // Invalider le cache pour cette recette
    await cacheService.invalidateRecipeCache(slug);

    return updatedRecipe as unknown as RecipeWithRelations;
  }

  async deleteRecipe(slug: string): Promise<RecipeWithRelations> {
    const recipe = await this.prisma.recipe.delete({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        ingredients: true,
        steps: true
      }
    });

    // Invalider le cache pour cette recette
    await cacheService.invalidateRecipeCache(slug);

    return recipe as unknown as RecipeWithRelations;
  }

  async addIngredients(recipeId: string, ingredients: Array<{ name: string; quantity: number; unit: string }>) {
    return this.prisma.ingredient.createMany({
      data: ingredients.map(ingredient => ({
        ...ingredient,
        recipeId
      }))
    });
  }

  async updateIngredient(ingredientId: string, data: { name?: string; quantity?: number; unit?: string }) {
    return this.prisma.ingredient.update({
      where: { id: ingredientId },
      data
    });
  }

  async addSteps(recipeId: string, steps: Array<{ description: string; duration: number; order: number }>) {
    return this.prisma.step.createMany({
      data: steps.map(step => ({
        ...step,
        recipeId
      }))
    });
  }

  async updateStep(stepId: string, data: { description?: string; duration?: number; order?: number; image?: string | null }) {
    return this.prisma.step.update({
      where: { id: stepId },
      data
    });
  }

  async searchRecipes(query: string, params?: PaginationParams): Promise<PaginatedResponse<RecipeWithRelations>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } }
          ]
        },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          ingredients: true,
          steps: true
        }
      }),
      this.prisma.recipe.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } }
          ]
        }
      })
    ]);

    return {
      items: recipes as unknown as RecipeWithRelations[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async filterRecipes(filters: {
    category?: 'STARTER' | 'MAIN' | 'DESSERT' | 'DRINK';
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    preparationTime?: number;
    cookingTime?: number;
  }, params?: PaginationParams): Promise<PaginatedResponse<RecipeWithRelations>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.preparationTime) where.preparationTime = { lte: filters.preparationTime };
    if (filters.cookingTime) where.cookingTime = { lte: filters.cookingTime };

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          ingredients: true,
          steps: true
        }
      }),
      this.prisma.recipe.count({ where })
    ]);

    return {
      items: recipes as unknown as RecipeWithRelations[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  validateRecipe(recipe: CreateRecipeInput): void {
    const errors = [];

    if (recipe.title.length < 3) {
      errors.push({ field: 'title', message: 'Le titre doit contenir au moins 3 caractères' });
    }

    if (recipe.description.length < 10) {
      errors.push({ field: 'description', message: 'La description doit contenir au moins 10 caractères' });
    }

    if (recipe.preparationTime < 0) {
      errors.push({ field: 'preparationTime', message: 'Le temps de préparation doit être positif' });
    }

    if (recipe.cookingTime < 0) {
      errors.push({ field: 'cookingTime', message: 'Le temps de cuisson doit être positif' });
    }

    if (recipe.servings < 1) {
      errors.push({ field: 'servings', message: 'Le nombre de portions doit être au moins 1' });
    }

    if (recipe.ingredients.length === 0) {
      errors.push({ field: 'ingredients', message: 'Au moins un ingrédient est requis' });
    }

    if (recipe.steps.length === 0) {
      errors.push({ field: 'steps', message: 'Au moins une étape est requise' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation de la recette échouée', errors);
    }
  }

  async generateSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.recipe.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
} 