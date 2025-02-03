const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// Helpers
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Une erreur est survenue');
  }
  return response.json();
};

// API Calls
export const api = {
  // Recettes
  recipes: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/recipes`);
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/recipes/${id}`);
      return handleResponse(response);
    },

    like: async (id: string) => {
      const response = await fetch(`${API_URL}/recipes/${id}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      return handleResponse(response);
    },

    comment: async (id: string, content: string) => {
      const response = await fetch(`${API_URL}/recipes/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });
      return handleResponse(response);
    },
  },

  // Newsletter
  newsletter: {
    subscribe: async (email: string) => {
      const response = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },

    unsubscribe: async (email: string) => {
      const response = await fetch(`${API_URL}/newsletter/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },
  },

  // Social
  social: {
    likeComment: async (recipeId: string, commentId: string) => {
      const response = await fetch(
        `${API_URL}/recipes/${recipeId}/comments/${commentId}/like`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      return handleResponse(response);
    },

    shareRecipe: async (recipeId: string, platform: string) => {
      const response = await fetch(`${API_URL}/recipes/${recipeId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      return handleResponse(response);
    },
  },
}; 