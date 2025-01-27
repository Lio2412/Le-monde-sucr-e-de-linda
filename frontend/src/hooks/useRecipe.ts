import useSWR from 'swr';
import type { Recipe } from '@/types/recipe';

// Fonction pour simuler un appel API
const fetchRecipe = async (slug: string): Promise<Recipe> => {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulation d'une réponse API
  const recipe: Recipe = {
    id: "1",
    title: "Tarte au Citron Meringuée",
    slug: "tarte-citron-meringuee",
    description: "Une tarte au citron traditionnelle, surmontée d'une meringue légère et aérienne.",
    mainImage: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&h=1200&fit=crop",
    category: "Tartes",
    difficulty: "moyen",
    preparationTime: 45,
    cookingTime: 30,
    servings: 8,
    ingredients: [
      { name: "Farine", quantity: 250, unit: "g" },
      { name: "Beurre", quantity: 125, unit: "g" },
      { name: "Sucre", quantity: 100, unit: "g" }
    ],
    steps: [
      { 
        description: "Préchauffer le four à 180°C (thermostat 6).",
        duration: 10,
        temperature: 180
      },
      { 
        description: "Dans un saladier, mélanger la farine et le beurre du bout des doigts jusqu'à obtenir une consistance sableuse.",
        duration: 15
      },
      { 
        description: "Ajouter le sucre et mélanger. Former une boule et laisser reposer au frais pendant 30 minutes.",
        duration: 30
      },
      { 
        description: "Étaler la pâte et la disposer dans un moule à tarte. Piquer le fond avec une fourchette.",
        duration: 10
      },
      { 
        description: "Faire cuire à blanc pendant 15 minutes.",
        duration: 15,
        temperature: 180
      }
    ],
    tags: ["Citron", "Meringue", "Dessert"]
  };

  return recipe;
};

export function useRecipe(slug: string) {
  const { data: recipe, error, isLoading, mutate } = useSWR<Recipe>(
    slug ? `/api/recipes/${slug}` : null,
    () => fetchRecipe(slug),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    }
  );

  return {
    recipe,
    isLoading,
    isError: error,
    mutate
  };
} 