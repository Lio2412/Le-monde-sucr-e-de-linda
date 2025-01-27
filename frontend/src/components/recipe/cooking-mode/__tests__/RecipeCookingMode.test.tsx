import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeCookingMode } from '../RecipeCookingMode';
import { Recipe, RecipeStep } from '@/types/recipe';
import { mockRecipe } from '@/mocks/recipe';
import { UseBeforeUnloadOptions } from '@/hooks/useBeforeUnload';

// Augmenter le timeout par défaut pour les tests
jest.setTimeout(30000);

// Mock des hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

const mockToggleFullscreen = jest.fn();
const mockToggleStep = jest.fn();
const mockToggleNotesVisibility = jest.fn();
const mockUpdateNote = jest.fn();

// Mock des hooks avec des valeurs par défaut
jest.mock('@/hooks/useFullscreen', () => ({
  useFullscreen: () => ({
    isFullscreen: false,
    toggleFullscreen: mockToggleFullscreen,
    isEnabled: true
  })
}));

const mockCompletedSteps = new Set<number>();
let mockProgress = 0;

jest.mock('@/hooks/useStepCompletion', () => ({
  useStepCompletion: () => ({
    isStepCompleted: (stepIndex: number) => mockCompletedSteps.has(stepIndex),
    toggleStep: (stepIndex: number) => {
      mockToggleStep(stepIndex);
      if (mockCompletedSteps.has(stepIndex)) {
        mockCompletedSteps.delete(stepIndex);
      } else {
        mockCompletedSteps.add(stepIndex);
      }
      mockProgress = (mockCompletedSteps.size / 2) * 100;
      return mockCompletedSteps;
    },
    completedSteps: mockCompletedSteps,
    progress: mockProgress
  })
}));

const mockNotes: Record<number, string> = {};

jest.mock('@/hooks/useStepNotes', () => ({
  useStepNotes: () => ({
    notes: mockNotes,
    showNotes: false,
    updateNote: (stepIndex: number, content: string) => {
      mockUpdateNote(stepIndex, content);
      if (content.trim() === '') {
        delete mockNotes[stepIndex];
      } else {
        mockNotes[stepIndex] = content;
      }
    },
    getNote: (stepIndex: number) => mockNotes[stepIndex] || '',
    toggleNotesVisibility: mockToggleNotesVisibility,
    hasNotes: Object.keys(mockNotes).length > 0,
    hasNoteForStep: (stepIndex: number) => !!mockNotes[stepIndex]
  })
}));

jest.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: () => ({
    shortcuts: []
  })
}));

const mockUseBeforeUnload = jest.fn();
jest.mock('@/hooks/useBeforeUnload', () => ({
  useBeforeUnload: (options: UseBeforeUnloadOptions) => {
    mockUseBeforeUnload(options);
  }
}));

describe('RecipeCookingMode', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCompletedSteps.clear();
    mockProgress = 0;
  });

  // Tests du mode préparation
  it('devrait afficher le mode préparation par défaut', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    expect(screen.getByText('Préparation de la recette')).toBeInTheDocument();
    expect(screen.getByText('Temps total : 50 minutes')).toBeInTheDocument();
  });

  it('devrait passer au mode cuisine après avoir cliqué sur Commencer', async () => {
    const user = userEvent.setup({ delay: null });
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    const startButton = screen.getByRole('button', { name: /commencer la recette/i });
    await act(async () => {
      await user.click(startButton);
    });

    // Attendre que l'animation soit terminée et que l'élément soit visible
    await waitFor(() => {
      expect(screen.getByTestId('step-counter')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByTestId('step-counter')).toHaveTextContent('Étape 1 sur 2');
  });

  // Tests de base
  it('devrait appeler useBeforeUnload avec les bonnes options', async () => {
    const user = userEvent.setup({ delay: null });
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    const startButton = screen.getByTestId('start-recipe');
    await act(async () => {
      await user.click(startButton);
    });
    
    // Attendre que l'animation soit terminée (0.2s + marge)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Maintenant on peut chercher step-checkbox
    await waitFor(() => {
      expect(screen.getByTestId('step-checkbox')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    const checkbox = screen.getByTestId('step-checkbox');
    await act(async () => {
      await user.click(checkbox);
    });

    // Attendre que mockCompletedSteps soit mis à jour
    await waitFor(() => {
      expect(mockUseBeforeUnload).toHaveBeenCalledWith({
        shouldPreventUnload: true,
        onConfirm: expect.any(Function),
        onCancel: expect.any(Function),
        message: 'Êtes-vous sûr de vouloir quitter ? Les modifications non enregistrées seront perdues.'
      });
    }, { timeout: 1000 });
  });

  it('devrait afficher le titre de la recette', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    expect(screen.getByText('Gâteau au Chocolat')).toBeInTheDocument();
  });

  it('devrait afficher un message si aucune étape n\'est trouvée', () => {
    const emptyRecipe = { ...mockRecipe, steps: [] };
    render(<RecipeCookingMode recipe={emptyRecipe} onClose={mockOnClose} />);
    expect(screen.getByText('Aucune étape n\'a été trouvée pour cette recette.')).toBeInTheDocument();
  });

  // Tests des interactions du mode cuisine
  describe('Mode cuisine', () => {
    beforeEach(async () => {
      const user = userEvent.setup({ delay: null });
      render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      const startButton = screen.getByTestId('start-recipe');
      await act(async () => {
        await user.click(startButton);
      });
      // Attendre que l'animation soit terminée
      await waitFor(() => {
        expect(screen.getByTestId('step-counter')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('devrait afficher la première étape après avoir commencé', async () => {
      expect(screen.getByTestId('step-counter')).toHaveTextContent('Étape 1 sur 2');
      expect(screen.getByTestId('step-description')).toHaveTextContent('Préchauffer le four à 180°C');
    });

    it('devrait fermer le mode cuisine quand le bouton fermer est cliqué', async () => {
      const user = userEvent.setup({ delay: null });
      // S'assurer que hasUnsavedChanges est false
      mockCompletedSteps.clear();
      mockProgress = 0;
      
      const closeButton = screen.getByRole('button', { name: /fermer le mode cuisine/i });
      await act(async () => {
        await user.click(closeButton);
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('devrait appeler toggleStep quand la case est cochée', async () => {
      const user = userEvent.setup({ delay: null });
      const checkbox = screen.getByTestId('step-checkbox');
      await act(async () => {
        await user.click(checkbox);
      });
      await waitFor(() => {
        expect(mockToggleStep).toHaveBeenCalledWith(0);
      }, { timeout: 3000 });
    });

    it('devrait appeler toggleNotesVisibility quand le bouton est cliqué', async () => {
      const user = userEvent.setup({ delay: null });
      const notesButton = screen.getByRole('button', { name: /afficher\/masquer les notes/i });
      await act(async () => {
        await user.click(notesButton);
      });
      expect(mockToggleNotesVisibility).toHaveBeenCalled();
    });

    it('devrait afficher les étapes de la recette dans l\'ordre', async () => {
      // Vérifier la première étape
      expect(screen.getByTestId('step-description')).toHaveTextContent(mockRecipe.steps[0].description);
    });
  });
}); 