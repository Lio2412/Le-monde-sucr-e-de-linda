export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
  adjustedQuantity?: number;
}

export interface RecipeStep {
  description: string;
  duration?: number; // en minutes
  temperature?: number;
}

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  date: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
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
  mainImage?: string;
  slug: string;
  tags: string[];
  comments?: Comment[];
  equipment?: string[]; // Liste optionnelle des équipements nécessaires
} 