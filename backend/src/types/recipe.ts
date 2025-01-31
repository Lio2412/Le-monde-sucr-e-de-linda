export enum RecipeDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum RecipeCategory {
  STARTER = 'STARTER',
  MAIN = 'MAIN',
  DESSERT = 'DESSERT',
  DRINK = 'DRINK'
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeStep {
  description: string;
  duration: number;
  order: number;
  image?: string;
}

export interface RecipeAuthor {
  id: string;
  email: string;
  name: string;
}

export interface RecipeWithRelations {
  id: string;
  slug: string;
  title: string;
  description: string;
  mainImage?: string | null;
  preparationTime: number;
  cookingTime: number;
  difficulty: RecipeDifficulty;
  servings: number;
  category: RecipeCategory;
  tags: string[];
  ingredients: Array<RecipeIngredient & { id: string; recipeId: string }>;
  steps: Array<RecipeStep & { id: string; recipeId: string }>;
  author: RecipeAuthor;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecipeInput {
  title: string;
  description: string;
  preparationTime: number;
  cookingTime: number;
  difficulty: RecipeDifficulty;
  servings: number;
  category: RecipeCategory;
  tags?: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface UpdateRecipeInput extends Partial<CreateRecipeInput> {
  mainImage?: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RecipeFilters {
  category?: RecipeCategory;
  difficulty?: RecipeDifficulty;
  search?: string;
} 