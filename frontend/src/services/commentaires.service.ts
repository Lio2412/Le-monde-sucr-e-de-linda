import { z } from 'zod';

// Schéma de validation pour un commentaire
export const commentaireSchema = z.object({
  id: z.string().optional(),
  contenu: z.string().min(1, 'Le contenu est requis'),
  auteurId: z.string(),
  auteurNom: z.string(),
  auteurEmail: z.string().email(),
  contenuId: z.string(),
  contenuType: z.enum(['recette', 'article']),
  parentId: z.string().optional(),
  statut: z.enum(['en_attente', 'approuve', 'rejete', 'signale']).default('en_attente'),
  motifRejet: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  metadata: z.object({
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    signalements: z.number().default(0),
    motifsSignalement: z.array(z.string()).optional(),
  }).optional(),
});

export type Commentaire = z.infer<typeof commentaireSchema>;

class CommentairesService {
  private readonly API_URL = '/api/commentaires';

  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
    contenuType?: string;
    contenuId?: string;
    statut?: string;
    dateDebut?: Date;
    dateFin?: Date;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.contenuType) queryParams.append('contenuType', params.contenuType);
    if (params?.contenuId) queryParams.append('contenuId', params.contenuId);
    if (params?.statut) queryParams.append('statut', params.statut);
    if (params?.dateDebut) queryParams.append('dateDebut', params.dateDebut.toISOString());
    if (params?.dateFin) queryParams.append('dateFin', params.dateFin.toISOString());

    const response = await fetch(`${this.API_URL}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des commentaires');
    }
    return response.json();
  }

  async getById(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du commentaire');
    }
    return response.json();
  }

  async create(data: Omit<Commentaire, 'id' | 'createdAt' | 'updatedAt'>) {
    const validatedData = commentaireSchema.omit({ 
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
      throw new Error('Erreur lors de la création du commentaire');
    }
    return response.json();
  }

  async update(id: string, data: Partial<Commentaire>) {
    const validatedData = commentaireSchema.partial().parse(data);

    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du commentaire');
    }
    return response.json();
  }

  async delete(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du commentaire');
    }
    return response.json();
  }

  async approuver(id: string) {
    const response = await fetch(`${this.API_URL}/${id}/approuver`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'approbation du commentaire');
    }
    return response.json();
  }

  async rejeter(id: string, motif: string) {
    const response = await fetch(`${this.API_URL}/${id}/rejeter`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ motif }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du rejet du commentaire');
    }
    return response.json();
  }

  async signaler(id: string, motif: string) {
    const response = await fetch(`${this.API_URL}/${id}/signaler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ motif }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du signalement du commentaire');
    }
    return response.json();
  }

  async getStatistiques() {
    const response = await fetch(`${this.API_URL}/statistiques`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    return response.json();
  }

  async actionMasse(ids: string[], action: 'approuver' | 'rejeter' | 'supprimer', motif?: string) {
    const response = await fetch(`${this.API_URL}/action-masse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, action, motif }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'action de masse sur les commentaires');
    }
    return response.json();
  }

  async ajouterReaction(commentaireId: string, type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') {
    const response = await fetch(`${this.API_URL}/${commentaireId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout de la réaction');
    }
    return response.json();
  }

  async supprimerReaction(commentaireId: string, type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') {
    const response = await fetch(`${this.API_URL}/${commentaireId}/reactions/${type}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la réaction');
    }
    return response.json();
  }
}

export const commentairesService = new CommentairesService(); 