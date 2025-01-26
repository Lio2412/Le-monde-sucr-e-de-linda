export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Step {
  order: number;
  description: string;
  image?: string;
}

export interface Recipe {
  id: number;
  title: string;
  slug: string;
  description: string;
  mainImage: string;
  gallery?: string[];
  category: 'Gâteaux' | 'Macarons' | 'Entremets' | 'Viennoiseries' | 'Autres';
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  preparationTime: number;
  cookingTime: number;
  servings: number;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating?: {
    average: number;
    count: number;
    userRating?: number;
  };
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
} 