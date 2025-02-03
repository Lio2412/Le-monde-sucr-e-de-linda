import { renderHook, act } from '@testing-library/react';
import { useRecipes } from '@/hooks/useRecipes';

describe('useRecipes Hook', () => {
  const mockRecipes = [
    {
      id: '1',
      title: 'Gâteau au Chocolat',
      description: 'Un délicieux gâteau au chocolat',
      prepTime: 30,
      difficulty: 'facile'
    },
    {
      id: '2',
      title: 'Tarte aux Pommes',
      description: 'Une tarte aux pommes traditionnelle',
      prepTime: 45,
      difficulty: 'moyen'
    }
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('fetches recipes successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecipes
    });

    const { result } = renderHook(() => useRecipes());

    await act(async () => {
      await result.current.fetchRecipes();
    });

    expect(result.current.recipes).toEqual(mockRecipes);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles fetch error gracefully', async () => {
    const error = new Error('Failed to fetch');
    (global.fetch as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRecipes());

    await act(async () => {
      await result.current.fetchRecipes();
    });

    expect(result.current.recipes).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Erreur lors du chargement des recettes');
  });

  it('filters recipes by category', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecipes
    });

    const { result } = renderHook(() => useRecipes());

    await act(async () => {
      await result.current.fetchRecipes();
      result.current.filterByCategory('Desserts');
    });

    expect(result.current.filteredRecipes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Gâteau au Chocolat' })
      ])
    );
  });

  it('sorts recipes by preparation time', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecipes
    });

    const { result } = renderHook(() => useRecipes());

    await act(async () => {
      await result.current.fetchRecipes();
      result.current.sortByPrepTime('asc');
    });

    expect(result.current.filteredRecipes[0].prepTime).toBeLessThanOrEqual(
      result.current.filteredRecipes[1].prepTime
    );
  });

  it('searches recipes by title', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecipes
    });

    const { result } = renderHook(() => useRecipes());

    await act(async () => {
      await result.current.fetchRecipes();
      result.current.searchRecipes('Chocolat');
    });

    expect(result.current.filteredRecipes).toEqual([
      expect.objectContaining({ title: 'Gâteau au Chocolat' })
    ]);
  });
});
