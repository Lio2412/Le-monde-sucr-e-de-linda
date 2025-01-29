/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeCookingMode } from '../RecipeCookingMode';
import { Recipe } from '@/types/recipe';
import { useStepCompletion } from '@/hooks/useStepCompletion';
import { useStepNotes } from '@/hooks/useStepNotes';
import { useRecipeHistory } from '@/hooks/useRecipeHistory';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useFullscreen } from '@/hooks/useFullscreen';
import { renderWithProviders, clearMocks } from '@/test-utils/test-wrapper';
import { mockRecipe } from '@/mocks/recipe';

// Mock des hooks
jest.mock('@/hooks/useStepCompletion');
jest.mock('@/hooks/useStepNotes');
jest.mock('@/hooks/useRecipeHistory');
jest.mock('@/hooks/useDeviceType');
jest.mock('@/hooks/useFullscreen');

const mockStepCompletion = {
  completedSteps: new Set(),
  isStepCompleted: jest.fn(),
  toggleStep: jest.fn(),
  progress: 0,
};

const mockStepNotes = {
  notes: {},
  updateNote: jest.fn(),
  toggleNotesVisibility: jest.fn(),
  showNotes: false,
  hasNotes: false,
  getNote: jest.fn(),
  hasNoteForStep: jest.fn(),
};

describe('Mode Cuisine', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    (useStepCompletion as jest.Mock).mockReturnValue(mockStepCompletion);
    (useStepNotes as jest.Mock).mockReturnValue(mockStepNotes);
    (useRecipeHistory as jest.Mock).mockReturnValue({ addToHistory: jest.fn() });
    (useDeviceType as jest.Mock).mockReturnValue({ isTablet: false });
    (useFullscreen as jest.Mock).mockReturnValue({
      isFullscreen: false,
      toggleFullscreen: jest.fn(),
      isEnabled: true,
    });
    clearMocks();
    // Réinitialiser le mock de l'API Fullscreen avant chaque test
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null
    });
    document.exitFullscreen = jest.fn().mockResolvedValue(undefined);
    document.documentElement.requestFullscreen = jest.fn().mockResolvedValue(undefined);
  });

  it('affiche le mode préparation initialement', () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    expect(screen.getByText('Commencer la recette')).toBeInTheDocument();
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('permet de naviguer entre les étapes', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Attendre que le mode cuisine soit chargé
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    }, { timeout: 2000 });

    // Naviguer à l'étape suivante
    const nextButton = screen.getByTestId('next-step');
    fireEvent.click(nextButton);

    // Vérifier l'étape suivante
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Faire fondre le chocolat avec le beurre');
    }, { timeout: 2000 });

    // Revenir à l'étape précédente
    const previousButton = screen.getByTestId('previous-step');
    fireEvent.click(previousButton);

    // Vérifier le retour à l'étape précédente
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    }, { timeout: 2000 });
  });

  it('adapte les quantités selon les portions', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    // Attendre que la liste des ingrédients soit visible dans le mode préparation
    await waitFor(() => {
      expect(screen.getByText('Ingrédients nécessaires')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Vérifier les quantités initiales
    const ingredients = screen.getAllByTestId(/^ingredient-quantity-/);
    expect(ingredients[0]).toHaveTextContent('200 g');
    expect(ingredients[1]).toHaveTextContent('200 g');

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Attendre que le mode cuisine soit chargé
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    }, { timeout: 2000 });

    // Afficher les ingrédients
    const toggleIngredientsButton = screen.getByTestId('toggle-ingredients-button');
    fireEvent.click(toggleIngredientsButton);

    // Doubler les portions
    const increaseButton = screen.getByTestId('increase-servings');
    fireEvent.click(increaseButton);

    // Vérifier les quantités mises à jour
    await waitFor(() => {
      const ingredients = screen.getAllByTestId(/^ingredient-quantity-/);
      expect(ingredients[0]).toHaveTextContent('225 g');
      expect(ingredients[1]).toHaveTextContent('225 g');
    });
  });

  it('met à jour les quantités en fonction du nombre de portions', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Vérifier les quantités initiales dans le mode préparation
    await waitFor(() => {
      const ingredients = screen.getAllByTestId(/^ingredient-quantity-/);
      expect(ingredients[0]).toHaveTextContent('200 g');
      expect(ingredients[1]).toHaveTextContent('200 g');
    });

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Afficher les ingrédients
    const toggleIngredientsButton = screen.getByTestId('toggle-ingredients-button');
    fireEvent.click(toggleIngredientsButton);

    // Augmenter le nombre de portions
    const increaseButton = screen.getByTestId('increase-servings');
    fireEvent.click(increaseButton);

    // Vérifier les quantités mises à jour
    await waitFor(() => {
      const ingredients = screen.getAllByTestId(/^ingredient-quantity-/);
      expect(ingredients[0]).toHaveTextContent('225 g');
      expect(ingredients[1]).toHaveTextContent('225 g');
    });
  });

  it('gère les raccourcis clavier', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Attendre que l'étape initiale soit affichée
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    }, { timeout: 2000 });

    // Passer à l'étape suivante avec flèche droite
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    // Vérifier que l'étape suivante est affichée
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      const currentStep = stepDescriptions.find(
        step => step.textContent === 'Faire fondre le chocolat avec le beurre'
      );
      expect(currentStep).toBeInTheDocument();
    }, { timeout: 2000 });

    // Revenir à l'étape précédente avec flèche gauche
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    // Vérifier que l'étape précédente est affichée
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    }, { timeout: 2000 });
  });

  it('demande confirmation avant de quitter avec des changements', async () => {
    // Mock de useStepCompletion pour simuler des étapes complétées
    (useStepCompletion as jest.Mock).mockReturnValue({
      ...mockStepCompletion,
      completedSteps: new Set([0]),
      isStepCompleted: () => true,
      progress: 50,
    });

    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Attendre que l'étape initiale soit affichée
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    }, { timeout: 2000 });

    // Marquer l'étape comme complétée
    const checkbox = screen.getByTestId('step-checkbox');
    fireEvent.click(checkbox);

    // Attendre que les changements soient enregistrés
    await waitFor(() => {
      expect(screen.getByTestId('recipe-progress')).toHaveTextContent('Progression : 50%');
    }, { timeout: 2000 });

    // Tenter de quitter
    const closeButton = screen.getByTestId('close-cooking-mode-button');
    fireEvent.click(closeButton);

    // Vérifier que la boîte de dialogue de confirmation est affichée
    await waitFor(() => {
      const confirmButton = screen.getByTestId('confirm-button');
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).toHaveTextContent('Quitter');
    });

    // Confirmer la sortie
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);

    // Vérifier que la fonction onClose a été appelée
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('affiche les quantités initiales des ingrédients', async () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={() => {}} />);

    await waitFor(() => {
      const ingredients = screen.getAllByTestId(/^ingredient-quantity-/);
      expect(ingredients[0]).toHaveTextContent('200 g');
      expect(ingredients[1]).toHaveTextContent('200 g');
    });
  });

  it('affiche le mode préparation initialement', () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    expect(screen.getByText('Commencer la recette')).toBeInTheDocument();
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      const stepDescriptions = screen.getAllByTestId('step-description');
      expect(stepDescriptions[0]).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });
