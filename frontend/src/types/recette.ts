export interface Ingredient {
  nom: string;
  quantite: string;
  unite: string;
}

export interface Etape {
  description: string;
  duree: string;
}

export interface Commentaire {
  id: string;
  contenu: string;
  dateCreation: string;
  utilisateur: {
    id: string;
    nom: string;
    avatar?: string;
  };
}

export interface PartageRecette {
  image: File | null;
  commentaire: string;
}

export interface Recette {
  id: string;
  titre: string;
  slug: string;
  description: string;
  tempsPreparation: number;
  tempsCuisson: number;
  difficulte: 'Facile' | 'Moyen' | 'Difficile';
  portions: number;
  ingredients: string[] | Ingredient[];
  instructions: string[] | Etape[];
  imageUrl?: string;
  categorie: string[];
  equipements?: string[];
  tags?: string[];
  dateCreation: string;
  dateMiseAJour: string;
  auteur: {
    id: string;
    nom: string;
    avatar?: string;
  };
  notes: {
    moyenne: number;
    total: number;
  };
  commentaires?: Commentaire[];
} 