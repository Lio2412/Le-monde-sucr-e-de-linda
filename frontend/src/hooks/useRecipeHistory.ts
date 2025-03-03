import { useState, useEffect, useCallback } from 'react';

interface RecipeHistoryItem {
  id: string;
  title: string;
  slug: string;
  lastVisited: string;
}

const MAX_HISTORY_ITEMS = 10;

export function useRecipeHistory() {
  const [history, setHistory] = useState<RecipeHistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('recipeHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addToHistory = useCallback((recipe: { id: string; title: string; slug: string }) => {
    setHistory(prevHistory => {
      // Vérifier si la recette est déjà dans l'historique avec les mêmes propriétés
      const existingRecipe = prevHistory.find(item => item.id === recipe.id);
      if (existingRecipe && 
          existingRecipe.title === recipe.title && 
          existingRecipe.slug === recipe.slug) {
        // Si la recette est identique, ne pas modifier l'historique
        return prevHistory;
      }

      const newHistory = prevHistory.filter(item => item.id !== recipe.id);
      const historyItem: RecipeHistoryItem = {
        ...recipe,
        lastVisited: new Date().toISOString()
      };
      
      const updatedHistory = [historyItem, ...newHistory].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem('recipeHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('recipeHistory');
    setHistory([]);
  };

  return {
    history,
    addToHistory,
    clearHistory
  };
}
