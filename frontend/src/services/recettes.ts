import { Recette } from '@/types/recette';

// Données temporaires en attendant le backend
const tempRecettes: Recette[] = [
  {
    id: "1",
    titre: "Tarte au Citron Meringuée",
    slug: "tarte-au-citron-meringuee",
    description: "Une tarte au citron traditionnelle, surmontée d'une meringue légère et aérienne.",
    tempsPreparation: 45,
    tempsCuisson: 45,
    difficulte: "Moyen",
    portions: 8,
    ingredients: [
      "250g de farine",
      "125g de beurre",
      "1 pincée de sel",
      "1 œuf",
      "60ml d'eau froide",
      "4 citrons",
      "150g de sucre",
      "4 œufs (pour la crème)",
      "3 blancs d'œufs (pour la meringue)",
      "150g de sucre glace"
    ],
    instructions: [
      "Préparer la pâte brisée en mélangeant la farine, le beurre et le sel",
      "Ajouter l'œuf et l'eau froide, former une boule et réserver au frais",
      "Étaler la pâte et foncer un moule à tarte",
      "Préparer la crème au citron",
      "Cuire la tarte à blanc puis garnir de crème au citron",
      "Préparer la meringue et la déposer sur la tarte",
      "Faire dorer la meringue au four"
    ],
    imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&h=1200&fit=crop",
    categorie: ["Tartes", "Desserts"],
    dateCreation: new Date().toISOString(),
    dateMiseAJour: new Date().toISOString(),
    auteur: {
      id: "1",
      nom: "Linda",
      avatar: "/images/linda-avatar.jpg"
    },
    notes: {
      moyenne: 4.8,
      total: 25
    }
  }
];

export async function getRecetteBySlug(slug: string): Promise<Recette | null> {
  try {
    console.log('Fetching recipe with slug:', decodeURIComponent(slug));
    
    // Simuler un délai pour imiter une requête API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const recette = tempRecettes.find(r => r.slug === slug);
    
    if (!recette) {
      console.log('Recipe not found');
      return null;
    }

    console.log('Recipe found:', recette);
    return recette;
  } catch (error) {
    console.error('Erreur lors de la récupération de la recette:', error);
    return null;
  }
}

export async function getAllRecettes(): Promise<Recette[]> {
  try {
    console.log('Fetching all recipes');
    
    // Simuler un délai pour imiter une requête API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return tempRecettes;
  } catch (error) {
    console.error('Erreur lors de la récupération des recettes:', error);
    return [];
  }
} 