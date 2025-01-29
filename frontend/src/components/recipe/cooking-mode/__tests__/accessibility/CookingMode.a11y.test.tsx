import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecipeCookingMode } from '../../RecipeCookingMode';
import { mockRecipe } from '@/mocks/recipe';
import { renderWithProviders } from '@/test-utils/test-wrapper';
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

expect.extend(toHaveNoViolations);

describe('Mode Cuisine - Tests d\'accessibilité', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper pour commencer la recette
  const startRecipe = async () => {
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    
    // Attendre que le composant StepDisplay soit monté avec un délai plus long
    await waitFor(() => {
      const stepDescription = screen.getByTestId('step-description');
      expect(stepDescription).toBeInTheDocument();
      expect(stepDescription).toHaveTextContent('Préchauffer le four à 180°C');
    }, { timeout: 5000 });
  };

  it('ne devrait pas avoir de violations d\'accessibilité dans le mode préparation', async () => {
    const { container } = renderWithProviders(
      <RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('start-recipe')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    const results = await axe(container, {
      runOnly: ['wcag2a', 'wcag2aa'],
      rules: {
        'color-contrast': { enabled: false }
      }
    });
    expect(results).toHaveNoViolations();
  }, 120000);

  it('ne devrait pas avoir de violations d\'accessibilité dans le mode cuisine', async () => {
    const { container } = renderWithProviders(
      <RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />
    );
    
    await startRecipe();
    
    await waitFor(() => {
      expect(screen.getByTestId('step-description')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    const results = await axe(container, {
      runOnly: ['wcag2a', 'wcag2aa'],
      rules: {
        'color-contrast': { enabled: false }
      }
    });
    expect(results).toHaveNoViolations();
  }, 120000);

  it('est navigable au clavier', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Vérifier que tous les éléments interactifs sont focusables
    const interactiveElements = screen.getAllByRole('button');
    
    // Vérifier chaque élément individuellement
    for (const element of interactiveElements) {
      // Nettoyer le focus avant chaque test
      if (document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur();
      }
      
      // Focus sur l'élément
      element.focus();
      
      // Vérifier le focus
      await waitFor(() => {
        expect(document.activeElement).toBe(element);
      });
    }
  });

  it('a des étiquettes ARIA appropriées', async () => {
    const { container } = renderWithProviders(
      <RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />
    );

    await startRecipe();

    // Vérifier les boutons de navigation
    const prevButton = screen.getByTestId('previous-step-button');
    const nextButton = screen.getByTestId('next-step-button');
    expect(prevButton).toHaveAttribute('aria-label', 'Étape précédente');
    expect(nextButton).toHaveAttribute('aria-label', 'Étape suivante');

    // Vérifier les boutons de contrôle
    const closeButton = screen.getByTestId('close-cooking-mode-button');
    expect(closeButton).toHaveAttribute('aria-label', 'Fermer le mode cuisine');

    // Le bouton plein écran n'est pas toujours disponible selon la plateforme
    const fullscreenButton = screen.queryByTestId('fullscreen-toggle');
    if (fullscreenButton) {
      expect(fullscreenButton).toHaveAttribute('aria-label', expect.stringMatching(/Activer le mode plein écran|Quitter le mode plein écran/));
    }

    const ingredientsButton = screen.getByTestId('toggle-ingredients-button');
    expect(ingredientsButton).toHaveAttribute('aria-label', 'Afficher/masquer les ingrédients');

    const notesButton = screen.getByTestId('notes-button');
    expect(notesButton).toHaveAttribute('aria-label', 'Afficher/masquer les notes');
  });

  it('maintient le focus lors de la navigation entre les étapes', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    await startRecipe();

    // Vérifier la gestion du focus
    const nextButton = screen.getByTestId('next-step-button');
    nextButton.focus();
    fireEvent.click(nextButton);
    expect(document.activeElement).toBe(nextButton);

    const prevButton = screen.getByTestId('previous-step-button');
    prevButton.focus();
    fireEvent.click(prevButton);
    expect(document.activeElement).toBe(prevButton);
  });

  it('gère correctement les annonces ARIA pour les changements d\'état', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    await startRecipe();

    // Vérifier l'indicateur de progression
    const progressElement = screen.getByTestId('recipe-progress');
    expect(progressElement).toHaveAttribute('role', 'status');
    expect(progressElement).toHaveAttribute('aria-live', 'polite');

    // Marquer une étape comme complétée
    const completeButton = screen.getByTestId('complete-step-button');
    fireEvent.click(completeButton);

    // Vérifier la mise à jour de la progression
    await waitFor(() => {
      expect(progressElement).toHaveTextContent(`Progression : ${Math.round(100 / mockRecipe.steps.length)}%`);
    }, { timeout: 5000 });
  });

  it('fournit des alternatives textuelles pour les icônes', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    await startRecipe();

    // Vérifier que toutes les icônes ont des attributs ARIA appropriés
    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      const svg = button.querySelector('svg');
      if (svg) {
        expect(button).toHaveAttribute('aria-label');
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      }
    }
  });

  it('gère correctement les messages d\'erreur et les notifications', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    await startRecipe();

    // Vérifier que les boutons de navigation ont les attributs ARIA corrects
    const nextButton = screen.getByTestId('next-step-button');
    expect(nextButton).toHaveAttribute('aria-label');

    const previousButton = screen.getByTestId('previous-step-button');
    expect(previousButton).toHaveAttribute('aria-label');

    // Vérifier que les messages de progression sont annoncés correctement
    const progressElement = screen.getByTestId('recipe-progress');
    expect(progressElement).toHaveAttribute('role', 'status');
    expect(progressElement).toHaveAttribute('aria-live', 'polite');
  });
}); 