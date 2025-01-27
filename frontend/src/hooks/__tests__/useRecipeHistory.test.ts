import { renderHook, act } from '@testing-library/react';
import { useRecipeHistory } from '../useRecipeHistory';

describe('useRecipeHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockRecipe = {
    id: '1',
    title: 'Tarte aux pommes',
    slug: 'tarte-aux-pommes'
  };

  it('devrait initialiser un historique vide', () => {
    const { result } = renderHook(() => useRecipeHistory());
    expect(result.current.history).toEqual([]);
  });

  it('devrait charger l\'historique existant depuis le localStorage', () => {
    const existingHistory = [{
      ...mockRecipe,
      lastVisited: new Date().toISOString()
    }];
    localStorage.setItem('recipeHistory', JSON.stringify(existingHistory));

    const { result } = renderHook(() => useRecipeHistory());
    expect(result.current.history).toEqual(existingHistory);
  });

  it('devrait ajouter une recette à l\'historique', () => {
    const { result } = renderHook(() => useRecipeHistory());

    act(() => {
      result.current.addToHistory(mockRecipe);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toMatchObject(mockRecipe);
    expect(result.current.history[0].lastVisited).toBeDefined();
  });

  it('devrait limiter l\'historique à 10 éléments', () => {
    const { result } = renderHook(() => useRecipeHistory());

    for (let i = 0; i < 12; i++) {
      act(() => {
        result.current.addToHistory({
          ...mockRecipe,
          id: String(i)
        });
      });
    }

    expect(result.current.history).toHaveLength(10);
  });

  it('devrait mettre à jour la date de dernière visite pour une recette existante', () => {
    const { result } = renderHook(() => useRecipeHistory());

    act(() => {
      result.current.addToHistory(mockRecipe);
    });

    const firstVisit = result.current.history[0].lastVisited;

    // Attendre un peu pour avoir une différence de temps
    jest.advanceTimersByTime(1000);

    act(() => {
      result.current.addToHistory(mockRecipe);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].lastVisited).not.toBe(firstVisit);
  });

  it('devrait effacer l\'historique', () => {
    const { result } = renderHook(() => useRecipeHistory());

    act(() => {
      result.current.addToHistory(mockRecipe);
    });

    expect(result.current.history).toHaveLength(1);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toHaveLength(0);
    expect(localStorage.getItem('recipeHistory')).toBeNull();
  });
}); 