import { z } from 'zod';
import { Recipe } from '@/types/recipe';

// Schéma de validation pour une recette
export const recetteSchema = z.object({
  id: z.string().optional(),
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  tempsPreparation: z.string().min(1, 'Le temps de préparation est requis'),
  tempsCuisson: z.string().min(1, 'Le temps de cuisson est requis'),
  difficulte: z.enum(['Facile', 'Moyen', 'Difficile']),
  portions: z.string().min(1, 'Le nombre de portions est requis'),
  ingredients: z.array(z.string()).min(1, 'Au moins un ingrédient est requis'),
  instructions: z.string().min(50, 'Les instructions doivent contenir au moins 50 caractères'),
  categorie: z.string().min(1, 'La catégorie est requise'),
  imageUrl: z.string().optional(),
  statut: z.enum(['brouillon', 'publié']).default('brouillon'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Recette = z.infer<typeof recetteSchema>;

class RecettesService {
  private readonly API_URL = '/api/recettes';

  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    statut?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.statut) queryParams.append('statut', params.statut);

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
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/recipes/${slug}`;
      const response = await fetch(url, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Recette non trouvée');
      }
      
      return response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la recette:', error);
      return null;
    }
  }

  async updateStatus(id: string, statut: 'brouillon' | 'publié') {
    return this.update(id, { statut });
  }
}

export const recettesService = new RecettesService(); 