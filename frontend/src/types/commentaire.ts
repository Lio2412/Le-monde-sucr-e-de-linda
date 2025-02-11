export interface Commentaire {
  id: string;
  contenu: string;
  auteurId: string;
  auteurNom: string;
  auteurEmail: string;
  contenuId: string;
  contenuType: 'article' | 'recette';
  statut: 'en_attente' | 'approuve' | 'rejete' | 'signale';
  parentId?: string;
  parent?: Commentaire;
  reponses?: Commentaire[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCommentaireDto {
  contenu: string;
  auteurId: string;
  auteurNom: string;
  auteurEmail?: string;
  contenuId?: string;
  contenuType?: 'article' | 'recette';
  parentId?: string;
  statut?: 'en_attente' | 'approuve' | 'rejete' | 'signale';
} 