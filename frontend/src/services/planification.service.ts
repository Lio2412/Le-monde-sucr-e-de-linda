import { z } from 'zod';

// Schéma de validation pour une publication planifiée
export const planificationSchema = z.object({
  id: z.string().optional(),
  contenuId: z.string(),
  contenuType: z.enum(['recette', 'article']),
  datePublication: z.date(),
  statut: z.enum(['planifie', 'publie', 'annule']).default('planifie'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  metadata: z.object({
    titre: z.string(),
    auteurId: z.string(),
    notificationProgrammee: z.boolean().default(false),
  }),
});

export type Planification = z.infer<typeof planificationSchema>;

class PlanificationService {
  private readonly API_URL = '/api/planification';

  async getAll(params?: { 
    page?: number; 
    limit?: number;
    contenuType?: string;
    statut?: string;
    dateDebut?: Date;
    dateFin?: Date;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.contenuType) queryParams.append('contenuType', params.contenuType);
    if (params?.statut) queryParams.append('statut', params.statut);
    if (params?.dateDebut) queryParams.append('dateDebut', params.dateDebut.toISOString());
    if (params?.dateFin) queryParams.append('dateFin', params.dateFin.toISOString());

    const response = await fetch(`${this.API_URL}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des planifications');
    }
    return response.json();
  }

  async planifier(data: Omit<Planification, 'id' | 'createdAt' | 'updatedAt'>) {
    const validatedData = planificationSchema.omit({ 
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
      throw new Error('Erreur lors de la planification');
    }
    return response.json();
  }

  async annuler(id: string) {
    const response = await fetch(`${this.API_URL}/${id}/annuler`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'annulation de la planification');
    }
    return response.json();
  }

  async replanifier(id: string, nouvelleDatePublication: Date) {
    const response = await fetch(`${this.API_URL}/${id}/replanifier`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ datePublication: nouvelleDatePublication }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la replanification');
    }
    return response.json();
  }

  async getProchaines(limit: number = 5) {
    const response = await fetch(`${this.API_URL}/prochaines?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des prochaines publications');
    }
    return response.json();
  }

  async getCalendrier(annee: number, mois: number) {
    const response = await fetch(`${this.API_URL}/calendrier/${annee}/${mois}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du calendrier');
    }
    return response.json();
  }
}

export const planificationService = new PlanificationService(); 