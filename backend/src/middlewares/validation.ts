import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RecipeDifficulty, RecipeCategory } from '../types/recipe.js';
import { VALIDATION, PAGINATION } from '../constants/index.js';
import { PaginationParams } from '../types/api.js';

const { RECIPE } = VALIDATION;

export const paginationSchema = z.object({
  page: z.string()
    .optional()
    .transform(val => val ? parseInt(val) : PAGINATION.DEFAULT_PAGE)
    .refine(val => val > 0, 'La page doit être supérieure à 0'),
  limit: z.string()
    .optional()
    .transform(val => val ? parseInt(val) : PAGINATION.DEFAULT_LIMIT)
    .refine(val => val > 0 && val <= PAGINATION.MAX_LIMIT, 
      `La limite doit être entre 1 et ${PAGINATION.MAX_LIMIT}`)
});

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'ingrédient est requis'),
  quantity: z.number().positive('La quantité doit être positive'),
  unit: z.string().min(1, 'L\'unité est requise')
});

export const stepSchema = z.object({
  description: z.string().min(1, 'La description est requise'),
  duration: z.number().int().positive('La durée doit être positive'),
  order: z.number().int().positive('L\'ordre doit être positif')
});

export const recipeSchema = z.object({
  title: z.string()
    .min(RECIPE.TITLE.MIN, `Le titre doit contenir au moins ${RECIPE.TITLE.MIN} caractères`)
    .max(RECIPE.TITLE.MAX, `Le titre ne doit pas dépasser ${RECIPE.TITLE.MAX} caractères`),
  description: z.string()
    .min(RECIPE.DESCRIPTION.MIN, `La description doit contenir au moins ${RECIPE.DESCRIPTION.MIN} caractères`),
  preparationTime: z.number()
    .int()
    .min(RECIPE.PREPARATION_TIME.MIN, 'Le temps de préparation doit être positif')
    .max(RECIPE.PREPARATION_TIME.MAX, 'Le temps de préparation ne peut pas dépasser 24 heures'),
  cookingTime: z.number()
    .int()
    .min(RECIPE.COOKING_TIME.MIN, 'Le temps de cuisson doit être positif ou nul')
    .max(RECIPE.COOKING_TIME.MAX, 'Le temps de cuisson ne peut pas dépasser 24 heures'),
  difficulty: z.nativeEnum(RecipeDifficulty),
  servings: z.number()
    .int()
    .min(RECIPE.SERVINGS.MIN, 'Le nombre de portions doit être positif')
    .max(RECIPE.SERVINGS.MAX, `Le nombre de portions ne peut pas dépasser ${RECIPE.SERVINGS.MAX}`),
  category: z.nativeEnum(RecipeCategory),
  tags: z.array(z.string()).optional(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(stepSchema)
    .refine(steps => {
      const orders = steps.map(step => step.order);
      const uniqueOrders = new Set(orders);
      return orders.length === uniqueOrders.size;
    }, 'Les ordres des étapes doivent être uniques')
    .refine(steps => {
      const orders = steps.map(step => step.order).sort((a, b) => a - b);
      return orders.every((order, index) => order === index + 1);
    }, 'Les ordres des étapes doivent être consécutifs')
});

export const validatePagination = (
  req: Request<any, any, any, PaginationParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Paramètres de pagination invalides',
        errors: result.error.errors.map(e => e.message)
      });
    }
    req.query = result.data as PaginationParams;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateRecipe = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = recipeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de recette invalides',
        errors: result.error.errors.map(e => e.message)
      });
    }
    req.body = result.data;
    next();
  } catch (error) {
    next(error);
  }
}; 