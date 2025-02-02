import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeWorkflow } from '../../components/RecipeWorkflow';
import { recipeService } from '../../services/recipeService';
import { useRecipeCache } from '../../hooks/useRecipeCache';
import { useAuth } from '../../hooks/useAuth';

jest.mock('../../services/recipeService');
jest.mock('../../hooks/useRecipeCache');
jest.mock('../../hooks/useAuth');

describe('Tests d\'Intégration RecipeWorkflow', () => {
  const mockUser = {
    id: '1',
    name: 'Linda',
    role: 'PATISSIER'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true
    });
  });

  it('devrait gérer le flux complet de création de recette', async () => {
    const mockCache = {
      cacheRecipe: jest.fn(),
      getCachedRecipe: jest.fn(),
      clearCache: jest.fn()
    };
    (useRecipeCache as jest.Mock).mockReturnValue(mockCache);
    (recipeService.createRecipe as jest.Mock).mockResolvedValueOnce({
      id: '1',
      title: 'Nouvelle recette'
    });

    render(<RecipeWorkflow />);

    // 1. Cliquer sur "Nouvelle recette"
    fireEvent.click(screen.getByText('Nouvelle recette'));

    // 2. Remplir le formulaire
    await userEvent.type(screen.getByLabelText('Titre'), 'Tarte aux pommes');
    await userEvent.type(screen.getByLabelText('Description'), 'Une délicieuse tarte');
    await userEvent.type(screen.getByLabelText('Durée (minutes)'), '45');

    // 3. Ajouter des ingrédients
    await userEvent.type(screen.getByLabelText('Nouvel ingrédient'), 'Pommes');
    fireEvent.click(screen.getByText('Ajouter un ingrédient'));

    // 4. Ajouter des étapes
    await userEvent.type(screen.getByLabelText('Nouvelle étape'), 'Préparer la pâte');
    fireEvent.click(screen.getByText('Ajouter une étape'));

    // 5. Soumettre le formulaire
    fireEvent.click(screen.getByText('Enregistrer'));

    // 6. Vérifier que la recette est créée et mise en cache
    await waitFor(() => {
      expect(recipeService.createRecipe).toHaveBeenCalled();
      expect(mockCache.cacheRecipe).toHaveBeenCalled();
      expect(screen.getByText('Recette créée avec succès')).toBeInTheDocument();
    });
  });

  it('devrait gérer le flux complet de modification de recette', async () => {
    const existingRecipe = {
      id: '1',
      title: 'Tarte aux pommes',
      description: 'Une délicieuse tarte',
      ingredients: ['Pommes'],
      steps: ['Préparer la pâte'],
      duration: 45,
      difficulty: 'Facile'
    };

    (recipeService.getRecipeById as jest.Mock).mockResolvedValueOnce(existingRecipe);
    (recipeService.updateRecipe as jest.Mock).mockResolvedValueOnce({
      ...existingRecipe,
      title: 'Tarte aux pommes modifiée'
    });

    render(<RecipeWorkflow recipeId="1" />);

    // 1. Vérifier que le formulaire est pré-rempli
    await waitFor(() => {
      expect(screen.getByLabelText('Titre')).toHaveValue(existingRecipe.title);
    });

    // 2. Modifier le titre
    await userEvent.clear(screen.getByLabelText('Titre'));
    await userEvent.type(screen.getByLabelText('Titre'), 'Tarte aux pommes modifiée');

    // 3. Soumettre les modifications
    fireEvent.click(screen.getByText('Enregistrer'));

    // 4. Vérifier que la recette est mise à jour
    await waitFor(() => {
      expect(recipeService.updateRecipe).toHaveBeenCalled();
      expect(screen.getByText('Recette mise à jour avec succès')).toBeInTheDocument();
    });
  });

  it('devrait gérer le flux complet de suppression de recette', async () => {
    const recipeToDelete = {
      id: '1',
      title: 'Recette à supprimer'
    };

    (recipeService.getRecipeById as jest.Mock).mockResolvedValueOnce(recipeToDelete);
    (recipeService.deleteRecipe as jest.Mock).mockResolvedValueOnce(true);

    render(<RecipeWorkflow recipeId="1" />);

    // 1. Cliquer sur le bouton de suppression
    fireEvent.click(screen.getByText('Supprimer la recette'));

    // 2. Confirmer la suppression
    fireEvent.click(screen.getByText('Confirmer la suppression'));

    // 3. Vérifier que la recette est supprimée
    await waitFor(() => {
      expect(recipeService.deleteRecipe).toHaveBeenCalledWith('1');
      expect(screen.getByText('Recette supprimée avec succès')).toBeInTheDocument();
    });
  });

  it('devrait gérer les erreurs dans le workflow', async () => {
    const error = new Error('Erreur serveur');
    (recipeService.createRecipe as jest.Mock).mockRejectedValueOnce(error);

    render(<RecipeWorkflow />);

    // 1. Tenter de créer une recette
    fireEvent.click(screen.getByText('Nouvelle recette'));
    await userEvent.type(screen.getByLabelText('Titre'), 'Test');
    fireEvent.click(screen.getByText('Enregistrer'));

    // 2. Vérifier que l'erreur est affichée
    await waitFor(() => {
      expect(screen.getByText('Erreur serveur')).toBeInTheDocument();
    });
  });

  it('devrait gérer la validation en temps réel', async () => {
    render(<RecipeWorkflow />);

    // 1. Cliquer sur "Nouvelle recette"
    fireEvent.click(screen.getByText('Nouvelle recette'));

    // 2. Taper un titre trop court
    await userEvent.type(screen.getByLabelText('Titre'), 'A');

    // 3. Vérifier le message d'erreur
    expect(screen.getByText('Le titre doit contenir au moins 3 caractères')).toBeInTheDocument();

    // 4. Corriger le titre
    await userEvent.type(screen.getByLabelText('Titre'), 'Abc');

    // 5. Vérifier que l'erreur disparaît
    expect(screen.queryByText('Le titre doit contenir au moins 3 caractères')).not.toBeInTheDocument();
  });
}); 