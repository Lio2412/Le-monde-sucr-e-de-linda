import { renderHook, act } from '@testing-library/react';
import { useRecipeManagement } from '@/hooks/useRecipeManagement';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

describe('useRecipeManagement Hook', () => {
  const mockUseSession = useSession as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    global.fetch = jest.fn();
    mockUseSession.mockClear();
    mockPush.mockClear();

    mockUseRouter.mockImplementation(() => ({
      push: mockPush
    }));

    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com' }
      },
      status: 'authenticated'
    });
  });

  it('creates a new recipe successfully', async () => {
    const newRecipe = {
      title: 'Nouvelle Recette',
      description: 'Description',
      ingredients: [{ name: 'Sucre', quantity: '100', unit: 'g' }],
      steps: [{ description: 'Mélanger', order: 1 }],
      prepTime: 30,
      cookTime: 20,
      servings: 4,
      difficulty: 'facile' as const,
      category: 'Desserts'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', ...newRecipe })
    });

    const { result } = renderHook(() => useRecipeManagement());

    await act(async () => {
      await result.current.createRecipe(newRecipe);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRecipe)
    });

    expect(mockPush).toHaveBeenCalledWith('/recettes/1');
  });

  it('handles recipe creation errors', async () => {
    const invalidRecipe = {
      title: '', // Invalid: empty title
      description: 'Description'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Le titre est requis'
      })
    });

    const { result } = renderHook(() => useRecipeManagement());

    await act(async () => {
      try {
        await result.current.createRecipe(invalidRecipe);
      } catch (error) {
        expect(error.message).toBe('Le titre est requis');
      }
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('updates a recipe successfully', async () => {
    const updates = {
      title: 'Titre Mis à Jour',
      description: 'Nouvelle description'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', ...updates })
    });

    const { result } = renderHook(() => useRecipeManagement());

    await act(async () => {
      await result.current.updateRecipe('1', updates);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/recipes/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
  });

  it('deletes a recipe successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    const { result } = renderHook(() => useRecipeManagement());

    await act(async () => {
      await result.current.deleteRecipe('1');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/recipes/1', {
      method: 'DELETE'
    });

    expect(mockPush).toHaveBeenCalledWith('/mes-recettes');
  });

  it('handles unauthorized recipe updates', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: 'Non autorisé'
      })
    });

    const { result } = renderHook(() => useRecipeManagement());

    await act(async () => {
      try {
        await result.current.updateRecipe('1', { title: 'Test' });
      } catch (error) {
        expect(error.message).toBe('Non autorisé');
      }
    });
  });

  it('validates recipe data before submission', async () => {
    const { result } = renderHook(() => useRecipeManagement());

    await act(async () => {
      try {
        await result.current.createRecipe({
          title: '',
          description: '',
          ingredients: [],
          steps: []
        });
      } catch (error) {
        expect(error.message).toMatch(/titre.*requis/i);
      }
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useRecipeManagement());

    await act(async () => {
      try {
        await result.current.createRecipe({
          title: 'Test Recipe',
          description: 'Test'
        });
      } catch (error) {
        expect(error.message).toBe('Erreur réseau');
      }
    });
  });
});
