/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeCookingMode } from '../RecipeCookingMode';
import { Recipe } from '@/types/recipe';
import { useStepCompletion } from '@/hooks/useStepCompletion';
import { useStepNotes } from '@/hooks/useStepNotes';
import { useRecipeHistory } from '@/hooks/useRecipeHistory';
import { useDeviceType } from '@/hooks/useDeviceType';

// Mock des hooks
jest.mock('@/hooks/useStepCompletion');
jest.mock('@/hooks/useStepNotes');
jest.mock('@/hooks/useRecipeHistory');
jest.mock('@/hooks/useDeviceType');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

const mockRecipe: Recipe = {
  id: '1',
  title: 'Tarte aux pommes',
  description: 'Une délicieuse tarte aux pommes',
  preparationTime: 30,
  cookingTime: 45,
  servings: 6,
  difficulty: 'facile',
  category: 'dessert',
  image: '/images/tarte-aux-pommes.jpg',
  mainImage: '/images/tarte-aux-pommes.jpg',
  slug: 'tarte-aux-pommes',
  tags: ['dessert', 'pommes'],
  ingredients: [
    { name: 'Pommes', quantity: 6, unit: 'pièces' },
    { name: 'Sucre', quantity: 100, unit: 'g' },
  ],
  steps: [
    { description: 'Préparer la pâte', duration: 0 },
    { description: 'Cuire au four', duration: 45 },
  ],
};

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
  beforeEach(() => {
    (useStepCompletion as jest.Mock).mockReturnValue(mockStepCompletion);
    (useStepNotes as jest.Mock).mockReturnValue(mockStepNotes);
    (useRecipeHistory as jest.Mock).mockReturnValue({ addToHistory: jest.fn() });
    (useDeviceType as jest.Mock).mockReturnValue({ isTablet: true });
  });

  it('affiche le mode préparation initialement', () => {
    const onClose = jest.fn();
    render(<RecipeCookingMode recipe={mockRecipe} onClose={onClose} />);
    expect(screen.getByText('Commencer la recette')).toBeInTheDocument();
  });

  it('passe en mode cuisine au clic sur Commencer', async () => {
    const onClose = jest.fn();
    render(<RecipeCookingMode recipe={mockRecipe} onClose={onClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);
    await waitFor(() => {
      expect(screen.getByTestId('step-description')).toHaveTextContent('Préparer la pâte');
    }, { timeout: 2000 });
  });

  it('permet de naviguer entre les étapes', async () => {
    const onClose = jest.fn();
    render(<RecipeCookingMode recipe={mockRecipe} onClose={onClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('step-description')).toHaveTextContent('Préparer la pâte');
    }, { timeout: 2000 });

    fireEvent.keyDown(window, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(screen.getByTestId('step-description')).toHaveTextContent('Cuire au four');
    }, { timeout: 2000 });
  });

  it('adapte les quantités selon les portions', async () => {
    const onClose = jest.fn();
    render(<RecipeCookingMode recipe={mockRecipe} onClose={onClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('step-description')).toBeInTheDocument();
    }, { timeout: 2000 });

    const increaseButton = screen.getByRole('button', { name: /augmenter les portions/i });
    fireEvent.click(increaseButton);
  });

  it('gère les raccourcis clavier', async () => {
    const onClose = jest.fn();
    render(<RecipeCookingMode recipe={mockRecipe} onClose={onClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('step-description')).toHaveTextContent('Préparer la pâte');
    }, { timeout: 2000 });

    fireEvent.keyDown(window, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(screen.getByTestId('step-description')).toHaveTextContent('Cuire au four');
    }, { timeout: 2000 });
  });

  it('demande confirmation avant de quitter avec des changements', async () => {
    const onClose = jest.fn();
    (useStepCompletion as jest.Mock).mockReturnValue({
      ...mockStepCompletion,
      completedSteps: new Set([0]),
      isStepCompleted: () => true,
      progress: 50,
    });

    render(<RecipeCookingMode recipe={mockRecipe} onClose={onClose} />);
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByTestId('step-description')).toBeInTheDocument();
    }, { timeout: 2000 });

    const closeButton = screen.getByRole('button', { name: /fermer le mode cuisine/i });
    fireEvent.click(closeButton);

    expect(screen.getByText('Quitter le mode cuisine')).toBeInTheDocument();
  });
}); 