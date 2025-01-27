import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeCookingMode } from '../RecipeCookingMode';
import { useFullscreen } from '@/hooks/useFullscreen';
import { Recipe } from '@/types/recipe';
import '@testing-library/jest-dom';

// Mock du hook useFullscreen
jest.mock('@/hooks/useFullscreen');

const mockRecipe: Recipe = {
  id: '1',
  title: 'Tarte aux pommes',
  description: 'Une délicieuse tarte aux pommes',
  preparationTime: 30,
  cookingTime: 45,
  servings: 8,
  difficulty: 'moyen',
  category: 'Tartes',
  slug: 'tarte-aux-pommes',
  tags: ['dessert', 'pommes'],
  ingredients: [
    { name: 'Pommes', quantity: 6, unit: 'pièces' },
    { name: 'Sucre', quantity: 100, unit: 'g' },
  ],
  steps: [
    {
      description: 'Préchauffer le four',
      duration: 0,
      temperature: 180,
    },
    {
      description: 'Préparer la pâte',
      duration: 15,
    },
  ],
};

describe('RecipeCookingMode', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useFullscreen as jest.Mock).mockReturnValue({
      isFullscreen: false,
      isEnabled: true,
      error: null,
      toggle: jest.fn(),
      enter: jest.fn(),
      exit: jest.fn(),
      toggleFullscreen: jest.fn(),
    });
  });

  it('devrait afficher le titre de la recette', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    expect(screen.getByText('Tarte aux pommes')).toBeInTheDocument();
  });

  it('devrait afficher la liste des ingrédients', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    expect(screen.getByRole('checkbox', { name: /6 pièces pommes/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /100 g sucre/i })).toBeInTheDocument();
  });

  it('devrait afficher les étapes de la recette', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    expect(screen.getByText(/préchauffer le four/i)).toBeInTheDocument();
  });

  it('devrait afficher le timer pour les étapes avec une durée', async () => {
    const user = userEvent.setup({ delay: null });
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    // Naviguer vers l'étape avec le timer
    const nextButton = screen.getByRole('button', { name: /suivant/i });
    await user.click(nextButton);
    
    // Vérifier que la durée est affichée
    expect(screen.getByText(/15 minutes/i)).toBeInTheDocument();
  });

  it('devrait appeler onClose quand le bouton fermer est cliqué', async () => {
    const user = userEvent.setup({ delay: null });
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /fermer le mode cuisine/i });
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('devrait basculer le mode plein écran quand le bouton est cliqué', async () => {
    const mockToggleFullscreen = jest.fn();
    (useFullscreen as jest.Mock).mockReturnValue({
      isFullscreen: false,
      isEnabled: true,
      error: null,
      toggleFullscreen: mockToggleFullscreen,
    });

    const user = userEvent.setup({ delay: null });
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    const fullscreenButton = screen.getByRole('button', { name: /passer en mode plein écran/i });
    await user.click(fullscreenButton);
    
    expect(mockToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('devrait afficher une icône différente en mode plein écran', () => {
    (useFullscreen as jest.Mock).mockReturnValue({
      isFullscreen: true,
      isEnabled: true,
      error: null,
      toggleFullscreen: jest.fn(),
    });

    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    expect(screen.getByRole('button', { name: /quitter le mode plein écran/i })).toBeInTheDocument();
  });

  describe('Navigation au clavier', () => {
    it('devrait naviguer vers l\'étape suivante avec la flèche droite', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      expect(screen.getByText(/préchauffer le four/i)).toBeInTheDocument();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText(/préparer la pâte/i)).toBeInTheDocument();
    });

    it('devrait naviguer vers l\'étape précédente avec la flèche gauche', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      // Aller à l'étape 2
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText(/préparer la pâte/i)).toBeInTheDocument();
      
      // Revenir à l'étape 1
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByText(/préchauffer le four/i)).toBeInTheDocument();
    });

    it('devrait fermer le mode cuisine avec la touche Escape', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      await user.keyboard('{Escape}');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('État des boutons de navigation', () => {
    it('devrait désactiver le bouton "Précédent" sur la première étape', () => {
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      const prevButton = screen.getByRole('button', { name: /précédent/i });
      expect(prevButton).toBeDisabled();
    });

    it('devrait désactiver le bouton "Suivant" sur la dernière étape', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      // Aller à la dernière étape
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText(/préparer la pâte/i)).toBeInTheDocument();
      
      const nextButton = screen.getByRole('button', { name: /suivant/i });
      expect(nextButton).toBeDisabled();
    });
  });
}); 