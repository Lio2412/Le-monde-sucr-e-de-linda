import { useCallback, useMemo } from 'react';
import { Recipe } from '@/types/recipe';

const CACHE_KEY = 'recipe_cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 heure

interface CacheEntry {
  data: Recipe;
  timestamp: number;
}

interface CacheData {
  [key: string]: CacheEntry;
}

export function useRecipeCache() {
  // Memoize les opérations de cache pour éviter de créer de nouvelles fonctions à chaque rendu
  const getCache = useCallback((): CacheData => {
    try {
      const cache = localStorage.getItem(CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch {
      return {};
    }
  }, []);

  const setCache = useCallback((data: CacheData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la mise en cache:', error);
    }
  }, []);

  // Utiliser des mémos pour éviter les rendus en cascade
  const cacheRecipe = useCallback((recipe: Recipe) => {
    if (!recipe?.id) return;
    
    const cache = getCache();
    if (cache[recipe.id]?.data) {
      // Si la recette est déjà en cache avec les mêmes données, ne rien faire
      const cachedData = cache[recipe.id].data;
      if (JSON.stringify(cachedData) === JSON.stringify(recipe)) {
        return;
      }
    }
    
    cache[recipe.id] = {
      data: recipe,
      timestamp: Date.now()
    };
    setCache(cache);
  }, [getCache, setCache]);

  const getCachedRecipe = useCallback((recipeId: string): Recipe | null => {
    if (!recipeId) return null;

    const cache = getCache();
    const entry = cache[recipeId];

    if (!entry) return null;

    // Vérifier si le cache est expiré
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      // Supprimer l'entrée expirée
      delete cache[recipeId];
      setCache(cache);
      return null;
    }

    return entry.data;
  }, [getCache, setCache]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
    }
  }, []);

  return {
    cacheRecipe,
    getCachedRecipe,
    clearCache
  };
} 