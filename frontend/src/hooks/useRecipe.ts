import useSWR from 'swr';
import type { Recipe } from '@/types/recipe';

// Fonction pour simuler un appel API
const fetchRecipe = async (slug: string): Promise<Recipe> => {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulation d'une réponse API
  const recipe: Recipe = {
    id: 1,
    title: "Tarte au Citron Meringuée",
    slug: "tarte-citron-meringuee",
    description: "Une tarte au citron traditionnelle, surmontée d'une meringue légère et aérienne.",
    mainImage: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&h=1200&fit=crop",
    category: "Gâteaux",
    difficulty: "Moyen",
    preparationTime: 45,
    cookingTime: 30,
    servings: 8,
    rating: {
      average: 4.5,
      count: 12,
      userRating: 0
    },
    ingredients: [
      { name: "Farine", quantity: 250, unit: "g" },
      { name: "Beurre", quantity: 125, unit: "g" },
      { name: "Sucre", quantity: 100, unit: "g" }
    ],
    steps: [
      { order: 1, description: "Préparer la pâte sablée..." },
      { order: 2, description: "Réaliser la crème au citron..." },
      { order: 3, description: "Monter la meringue..." }
    ],
    tags: ["Citron", "Meringue", "Dessert"],
    author: {
      id: "1",
      name: "Linda",
      avatar: "/images/linda.jpg"
    },
    published: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return recipe;
};

export function useRecipe(slug: string) {
  const { data: recipe, error, isLoading, mutate } = useSWR<Recipe>(
    slug ? `/api/recipes/${slug}` : null,
    () => fetchRecipe(slug),
    {
      revalidateOnFocus: false, // Désactive la revalidation au focus
      revalidateOnReconnect: true, // Active la revalidation à la reconnexion
      dedupingInterval: 60000, // Cache les données pendant 1 minute
    }
  );

  return {
    recipe,
    isLoading,
    isError: error,
    mutate // Pour mettre à jour manuellement les données
  };
} 