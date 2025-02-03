import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export interface Recipe {
  id?: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  steps: Array<{
    description: string;
    order: number;
  }>;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: 'facile' | 'moyen' | 'difficile';
  category?: string;
  image?: string;
  authorId?: string;
}

export const useRecipeManagement = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateRecipe = (recipe: Partial<Recipe>) => {
    if (!recipe.title?.trim()) {
      throw new Error('Le titre est requis');
    }
    if (!recipe.description?.trim()) {
      throw new Error('La description est requise');
    }
    if (!recipe.ingredients?.length) {
      throw new Error('Au moins un ingrédient est requis');
    }
    if (!recipe.steps?.length) {
      throw new Error('Au moins une étape est requise');
    }
  };

  const createRecipe = async (recipe: Partial<Recipe>) => {
    try {
      setError(null);
      setLoading(true);
      validateRecipe(recipe);

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipe)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création de la recette');
      }

      const newRecipe = await response.json();
      router.push(`/recettes/${newRecipe.id}`);
      return newRecipe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour de la recette');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression de la recette');
      }

      router.push('/mes-recettes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    error,
    loading,
    isAuthenticated: !!session,
    user: session?.user
  };
};
