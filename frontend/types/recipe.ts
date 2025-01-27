export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeStep {
  description: string;
  duration?: number; // en minutes
  temperature?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  category: string;
  image?: string;
} 