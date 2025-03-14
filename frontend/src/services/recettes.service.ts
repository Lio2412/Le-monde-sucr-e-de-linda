import { z } from 'zod';
import { Recipe } from '@/types/recipe';

// Schéma de validation pour un ingrédient
const ingredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom de l\'ingrédient est requis'),
  quantity: z.number().positive('La quantité doit être positive'),
  unit: z.string().min(1, 'L\'unité est requise'),
});

// Schéma de validation pour une étape
const stepSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().positive('L\'ordre doit être un nombre positif'),
  content: z.string().min(3, 'Le contenu de l\'étape doit contenir au moins 3 caractères'),
});

// Schéma de validation pour une recette
export const recetteSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').optional(),
  image: z.string().url('L\'URL de l\'image n\'est pas valide').optional(),
  servings: z.number().int().positive('Le nombre de portions doit être positif').default(4),
  prepTime: z.number().int().positive('Le temps de préparation doit être positif').optional(),
  cookTime: z.number().int().positive('Le temps de cuisson doit être positif').optional(),
  difficulty: z.enum(['Facile', 'Moyen', 'Difficile']).optional(),
  ingredients: z.array(ingredientSchema).min(1, 'Au moins un ingrédient est requis'),
  steps: z.array(stepSchema).min(1, 'Au moins une étape est requise'),
  categories: z.array(z.string()).optional(),
  userId: z.string().optional(),
});

export type Recette = z.infer<typeof recetteSchema>;

class RecettesService {
  private readonly API_URL = '/api/recettes';

  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    category?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);

    const response = await fetch(`${this.API_URL}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des recettes');
    }
    return response.json();
  }

  async getById(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la recette');
    }
    return response.json();
  }

  async create(data: Recette) {
    // Valider les données avant l'envoi
    const validatedData = recetteSchema.parse(data);

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la recette');
    }
    return response.json();
  }

  async update(id: string, data: Partial<Recette>) {
    // Valider les données avant l'envoi
    const validatedData = recetteSchema.partial().parse(data);

    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la recette');
    }
    return response.json();
  }

  async delete(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la recette');
    }
    return response.json();
  }

  async getBySlug(slug: string): Promise<Recipe | null> {
    try {
      // Recherche par titre (à adapter si vous avez un champ slug)
      const params = new URLSearchParams();
      params.append('search', slug);
      
      const response = await fetch(`${this.API_URL}?${params}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Recette non trouvée');
      }
      
      const data = await response.json();
      // Retourne la première recette trouvée
      return data.recettes[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la recette:', error);
      return null;
    }
  }

  async getCategories() {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des catégories');
    }
    return response.json();
  }
}

export const recettesService = new RecettesService(); 