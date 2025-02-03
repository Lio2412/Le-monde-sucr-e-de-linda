import { z } from 'zod';

// Schéma de validation pour un article
export const articleSchema = z.object({
  id: z.string().optional(),
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  extrait: z.string().min(10, 'L\'extrait doit contenir au moins 10 caractères'),
  contenu: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères'),
  categorie: z.string().min(1, 'La catégorie est requise'),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  statut: z.enum(['brouillon', 'publié']).default('brouillon'),
  datePublication: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  slug: z.string().optional(),
  auteurId: z.string().optional(),
  seo: z.object({
    titre: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export type Article = z.infer<typeof articleSchema>;

class BlogService {
  private readonly API_URL = '/api/blog';

  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    statut?: string;
    categorie?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.statut) queryParams.append('statut', params.statut);
    if (params?.categorie) queryParams.append('categorie', params.categorie);

    const response = await fetch(`${this.API_URL}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des articles');
    }
    return response.json();
  }

  async getById(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'article');
    }
    return response.json();
  }

  async create(data: Article) {
    // Valider les données avant l'envoi
    const validatedData = articleSchema.parse(data);

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de l\'article');
    }
    return response.json();
  }

  async update(id: string, data: Partial<Article>) {
    // Valider les données avant l'envoi
    const validatedData = articleSchema.partial().parse(data);

    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de l\'article');
    }
    return response.json();
  }

  async delete(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'article');
    }
    return response.json();
  }

  async updateStatus(id: string, statut: 'brouillon' | 'publié') {
    return this.update(id, { statut });
  }

  async planifierPublication(id: string, datePublication: Date) {
    return this.update(id, { datePublication });
  }
}

export const blogService = new BlogService(); 