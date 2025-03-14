import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Step {
  description: string;
  order: number;
  duration?: number;
}

export interface RecipeFormData {
  title: string;
  description: string;
  preparationTime: number;
  cookingTime: number;
  difficulty: string;
  servings: number;
  category: string;
  ingredients: Ingredient[];
  steps: Step[];
  status: string;
  image?: File;
  imageUrl?: string;
}

export interface ImageUploadResponse {
  url: string;
}

export const adminService = {
  // Récupérer toutes les recettes avec pagination
  getRecipes: async (page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/api/admin/recipes`, {
      params: { page, limit },
      withCredentials: true
    });
    return response.data;
  },

  // Récupérer une recette par ID
  getRecipe: async (id: string) => {
    const response = await axios.get(`${API_URL}/api/admin/recipes/${id}`, {
      withCredentials: true
    });
    return response.data;
  },

  // Créer une nouvelle recette
  createRecipe: async (data: RecipeFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'ingredients' || key === 'steps') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await axios.post(`${API_URL}/api/admin/recipes`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Mettre à jour une recette
  updateRecipe: async (id: string, data: RecipeFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'ingredients' || key === 'steps') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await axios.put(`${API_URL}/api/admin/recipes/${id}`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Supprimer une recette
  deleteRecipe: async (id: string) => {
    const response = await axios.delete(`${API_URL}/api/admin/recipes/${id}`, {
      withCredentials: true
    });
    return response.data;
  },

  // Récupérer les statistiques du dashboard
  getDashboardStats: async () => {
    const response = await axios.get(`${API_URL}/api/admin/stats`, {
      withCredentials: true
    });
    return response.data;
  },

  uploadImage: async (formData: FormData): Promise<ImageUploadResponse> => {
    const response = await axios.post(`${API_URL}/admin/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });
    return response.data;
  },

  createRecipe: async (data: RecipeFormData): Promise<any> => {
    const response = await axios.post(`${API_URL}/admin/recipes`, data, {
      withCredentials: true,
    });
    return response.data;
  },
}; 