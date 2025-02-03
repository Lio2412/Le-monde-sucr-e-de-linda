import { z } from 'zod';

// Schéma de validation pour un tag
export const tagSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  description: z.string().optional(),
  couleur: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  metadata: z.object({
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    nombreArticles: z.number().optional(),
    nombreRecettes: z.number().optional(),
  }).optional(),
});

export type Tag = z.infer<typeof tagSchema>;

class TagsService {
  private readonly API_URL = '/api/tags';

  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    type?: 'article' | 'recette';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);

    const response = await fetch(`${this.API_URL}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tags');
    }
    return response.json();
  }

  async getById(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du tag');
    }
    return response.json();
  }

  async create(data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) {
    const validatedData = tagSchema.omit({ 
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
      throw new Error('Erreur lors de la création du tag');
    }
    return response.json();
  }

  async update(id: string, data: Partial<Tag>) {
    const validatedData = tagSchema.partial().parse(data);

    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du tag');
    }
    return response.json();
  }

  async delete(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du tag');
    }
    return response.json();
  }

  async fusionner(sourceId: string, destinationId: string) {
    const response = await fetch(`${this.API_URL}/fusionner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceId, destinationId }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la fusion des tags');
    }
    return response.json();
  }

  async getPopulaires(params?: { 
    limit?: number;
    type?: 'article' | 'recette';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);

    const response = await fetch(`${this.API_URL}/populaires?${queryParams}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tags populaires');
    }
    return response.json();
  }
}

export const tagsService = new TagsService(); 