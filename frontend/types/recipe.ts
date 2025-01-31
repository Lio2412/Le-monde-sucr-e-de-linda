export interface Step {
  id: string;
  order: number;
  description: string;
  duration: number;
  image?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  mainImage?: string;
  preparationTime: number;
  cookingTime: number;
  difficulty: string;
  servings: number;
  category: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
