export interface Recette {
  id: string;
  titre: string;
  slug: string;
  description: string;
  tempsPreparation: number;
  tempsCuisson: number;
  difficulte: 'Facile' | 'Moyen' | 'Difficile';
  portions: number;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  categorie: string[];
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
} 