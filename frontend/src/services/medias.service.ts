import { z } from 'zod';

// Schéma de validation pour un média
export const mediaSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(1, 'Le nom est requis'),
  type: z.enum(['image', 'video', 'document']),
  url: z.string().min(1, 'L\'URL est requise'),
  miniatureUrl: z.string().optional(),
  taille: z.number(),
  format: z.string(),
  alt: z.string().optional(),
  description: z.string().optional(),
  dossier: z.string().default('general'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  metadata: z.object({
    largeur: z.number().optional(),
    hauteur: z.number().optional(),
    duree: z.number().optional(),
  }).optional(),
});

export type Media = z.infer<typeof mediaSchema>;

class MediasService {
  private readonly API_URL = '/api/medias';

  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    type?: string;
    dossier?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.dossier) queryParams.append('dossier', params.dossier);

    const response = await fetch(`${this.API_URL}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des médias');
    }
    return response.json();
  }

  async upload(file: File, metadata?: Partial<Media>) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(`${this.API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'upload du média');
    }
    return response.json();
  }

  async update(id: string, data: Partial<Media>) {
    const validatedData = mediaSchema.partial().parse(data);

    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du média');
    }
    return response.json();
  }

  async delete(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du média');
    }
    return response.json();
  }

  async createDossier(nom: string) {
    const response = await fetch(`${this.API_URL}/dossiers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nom }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du dossier');
    }
    return response.json();
  }

  async getDossiers() {
    const response = await fetch(`${this.API_URL}/dossiers`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des dossiers');
    }
    return response.json();
  }

  async deplacerMedia(id: string, dossier: string) {
    return this.update(id, { dossier });
  }
}

export const mediasService = new MediasService(); 