export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Step {
  description: string;
  duration: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  mainImage: string;
  preparationTime: number;
  cookingTime: number;
  difficulty: string;
  servings: number;
  category: string;
  tags: string[];
  ingredients: Ingredient[];
  equipment: string[];
  steps: Step[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ShareData {
  image: File | null;
  comment: string;
} 