import { z } from 'zod';

// Schéma de validation pour une catégorie
export const categorieSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  description: z.string().optional(),
  couleur: z.string().optional(),
  icone: z.string().optional(),
  parentId: z.string().optional(),
  ordre: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  metadata: z.object({
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    nombreArticles: z.number().optional(),
  }).optional(),
});

export type Categorie = z.infer<typeof categorieSchema>;

class CategoriesService {
  private readonly API_URL = '/api/categories';

  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    parentId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.parentId) queryParams.append('parentId', params.parentId);

    const response = await fetch(`${this.API_URL}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des catégories');
    }
    return response.json();
  }

  async getById(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la catégorie');
    }
    return response.json();
  }

  async create(data: Omit<Categorie, 'id' | 'createdAt' | 'updatedAt'>) {
    const validatedData = categorieSchema.omit({ 
      id: true, 
      createdAt: true, 
      updatedAt: true 
    }).parse(data);

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la catégorie');
    }
    return response.json();
  }

  async update(id: string, data: Partial<Categorie>) {
    const validatedData = categorieSchema.partial().parse(data);

    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la catégorie');
    }
    return response.json();
  }

  async delete(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la catégorie');
    }
    return response.json();
  }

  async reordonner(categories: { id: string; ordre: number }[]) {
    const response = await fetch(`${this.API_URL}/reordonner`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categories }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la réorganisation des catégories');
    }
    return response.json();
  }

  async getArborescence() {
    const response = await fetch(`${this.API_URL}/arborescence`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'arborescence des catégories');
    }
    return response.json();
  }
}

export const categoriesService = new CategoriesService(); 