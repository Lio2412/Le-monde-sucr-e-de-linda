export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
  tags: string[];
  image: string;
  rating: number;
  author: string;
  createdAt: string;
  updatedAt: string;
} 