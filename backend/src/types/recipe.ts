export interface Recipe {
  id: string;
  title: string;
  description: string;
  slug: string;
  preparationTime: number;
  cookingTime: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  servings: number;
  category: 'STARTER' | 'MAIN' | 'DESSERT' | 'DRINK';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  recipeId: string;
}

export interface Step {
  id: string;
  description: string;
  duration: number;
  order: number;
  imageUrl?: string;
  recipeId: string;
}

export interface CreateRecipeInput {
  title: string;
  description: string;
  preparationTime: number;
  cookingTime: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  servings: number;
  category: 'STARTER' | 'MAIN' | 'DESSERT' | 'DRINK';
  ingredients: Omit<Ingredient, 'id' | 'recipeId'>[];
  steps: Omit<Step, 'id' | 'recipeId'>[];
  tags: string[];
} 