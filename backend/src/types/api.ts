import { Request } from 'express';
import { RecipeWithRelations, CreateRecipeInput, UpdateRecipeInput } from './recipe.js';
import { ParamsDictionary } from 'express-serve-static-core';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface PaginationParams {
  page?: string;
  limit?: string;
  [key: string]: string | undefined;
}

export interface RecipeQueryParams extends PaginationParams {
  search?: string;
  category?: string;
  difficulty?: string;
}

export type RecipeParams = {
  slug: string;
} & ParamsDictionary;

export interface RecipeRequest extends Request<
  RecipeParams,
  any,
  CreateRecipeInput | UpdateRecipeInput,
  RecipeQueryParams
> {
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface RecipeResponse extends ApiResponse {
  data?: RecipeWithRelations;
}

export interface RecipeListResponse extends ApiResponse {
  data?: {
    recipes: RecipeWithRelations[];
    total: number;
    page: number;
    totalPages: number;
  };
} 