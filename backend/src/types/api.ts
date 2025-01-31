import { Recipe } from './recipe';
import { Request } from 'express';

export interface RecipeRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

export interface RecipeResponse extends ApiResponse<Recipe> {}

export interface RecipeListResponse extends ApiResponse<{
  recipes: Recipe[];
  total: number;
  page: number;
  totalPages: number;
}> {} 