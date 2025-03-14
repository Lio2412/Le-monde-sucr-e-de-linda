import { api as apiClient } from '@/lib/api-client';

// Types
export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  preparationTime: string;
  cookingTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  rating: number;
  likes: number;
  comments: Comment[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
}

// API Calls
export const api = {
  // Recettes
  recipes: {
    getAll: async () => {
      return await apiClient.get<Recipe[]>('/api/recipes');
    },

    getById: async (id: string) => {
      return await apiClient.get<Recipe>(`/api/recipes/${id}`);
    },

    like: async (id: string) => {
      return await apiClient.post<{success: boolean}>(`/api/recipes/${id}/like`);
    },

    comment: async (id: string, content: string) => {
      return await apiClient.post<Comment>(`/api/recipes/${id}/comments`, { content });
    },
  },

  // Newsletter
  newsletter: {
    subscribe: async (email: string) => {
      return await apiClient.post<{success: boolean}>('/api/newsletter/subscribe', { email });
    },

    unsubscribe: async (email: string) => {
      return await apiClient.post<{success: boolean}>('/api/newsletter/unsubscribe', { email });
    },
  },

  // Social
  social: {
    likeComment: async (recipeId: string, commentId: string) => {
      return await apiClient.post<{success: boolean}>(`/api/recipes/${recipeId}/comments/${commentId}/like`);
    },

    shareRecipe: async (recipeId: string, platform: string) => {
      return await apiClient.post<{success: boolean, shareUrl: string}>(`/api/recipes/${recipeId}/share`, { platform });
    },
  },
}; 