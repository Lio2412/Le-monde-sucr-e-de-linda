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

  describe('Marquage des étapes', () => {
    it('devrait afficher une case à cocher pour marquer l\'étape comme terminée', () => {
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      const checkbox = screen.getByRole('checkbox', { name: /marquer comme terminée/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('devrait marquer l\'étape comme terminée quand la case est cochée', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      const checkbox = screen.getByRole('checkbox', { name: /marquer comme terminée/i });
      await user.click(checkbox);
      
      expect(checkbox).toBeChecked();
      expect(screen.getByText(/préchauffer le four/i)).toHaveClass('text-muted-foreground', 'line-through');
    });

    it('devrait afficher la progression dans le header', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      expect(screen.getByText('Progression : 0%')).toBeInTheDocument();
      
      const checkbox = screen.getByRole('checkbox', { name: /marquer comme terminée/i });
      await user.click(checkbox);
      
      expect(screen.getByText('Progression : 50%')).toBeInTheDocument(); // 1/2 étapes = 50%
    });

    it('devrait conserver l\'état de complétion lors de la navigation entre les étapes', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      // Marquer la première étape comme terminée
      const firstCheckbox = screen.getByRole('checkbox', { name: /marquer comme terminée/i });
      await user.click(firstCheckbox);
      
      // Aller à l'étape suivante
      const nextButton = screen.getByRole('button', { name: /suivant/i });
      await user.click(nextButton);
      
      // Revenir à la première étape
      const prevButton = screen.getByRole('button', { name: /précédent/i });
      await user.click(prevButton);
      
      // Vérifier que la première étape est toujours marquée comme terminée
      const checkboxAfterNavigation = screen.getByRole('checkbox', { name: /marquer comme terminée/i });
      expect(checkboxAfterNavigation).toBeChecked();
    });
  });

  describe('Système de notes', () => {
    it('devrait afficher le bouton pour ouvrir les notes', () => {
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      const notesButton = screen.getByRole('button', { name: /afficher\/masquer les notes/i });
      expect(notesButton).toBeInTheDocument();
    });

    it('devrait afficher le panneau de notes quand le bouton est cliqué', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      const notesButton = screen.getByRole('button', { name: /afficher\/masquer les notes/i });
      await user.click(notesButton);
      
      expect(screen.getByText(/notes pour l'étape 1/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/ajoutez vos notes ici/i)).toBeInTheDocument();
    });

    it('devrait afficher un indicateur quand une note existe', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      // Ouvrir le panneau de notes
      const notesButton = screen.getByRole('button', { name: /afficher\/masquer les notes/i });
      await user.click(notesButton);
      
      // Ajouter une note
      const textarea = screen.getByPlaceholderText(/ajoutez vos notes ici/i);
      await user.type(textarea, 'Ma note pour l\'étape 1');
      
      // Vérifier que l'indicateur est affiché
      expect(screen.getByText(/note ajoutée/i)).toBeInTheDocument();
    });

    it('devrait conserver les notes lors de la navigation entre les étapes', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      // Ouvrir le panneau de notes et ajouter une note
      const notesButton = screen.getByRole('button', { name: /afficher\/masquer les notes/i });
      await user.click(notesButton);
      await user.type(screen.getByPlaceholderText(/ajoutez vos notes ici/i), 'Note étape 1');
      
      // Aller à l'étape suivante
      const nextButton = screen.getByRole('button', { name: /suivant/i });
      await user.click(nextButton);
      
      // Ajouter une note pour l'étape 2
      await user.type(screen.getByPlaceholderText(/ajoutez vos notes ici/i), 'Note étape 2');
      
      // Revenir à l'étape 1
      const prevButton = screen.getByRole('button', { name: /précédent/i });
      await user.click(prevButton);
      
      // Vérifier que la note de l'étape 1 est toujours présente
      expect(screen.getByPlaceholderText(/ajoutez vos notes ici/i)).toHaveValue('Note étape 1');
    });

    it('devrait basculer l\'affichage des notes avec le raccourci T', async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      // Les notes ne sont pas visibles initialement
      expect(screen.queryByText(/notes pour l'étape 1/i)).not.toBeInTheDocument();
      
      // Utiliser le raccourci clavier
      await user.keyboard('t');
      
      // Les notes sont maintenant visibles
      expect(screen.getByText(/notes pour l'étape 1/i)).toBeInTheDocument();
      
      // Utiliser à nouveau le raccourci
      await user.keyboard('t');
      
      // Les notes sont à nouveau masquées
      expect(screen.queryByText(/notes pour l'étape 1/i)).not.toBeInTheDocument();
    });
  });
}); 