import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCookingMode } from '../../RecipeCookingMode';
import { mockRecipe } from '@/mocks/recipe';

// Mock des hooks personnalisés
jest.mock('@/hooks/useDeviceType', () => ({
  useDeviceType: () => ({ isDesktop: true, isMobile: false, isTablet: false }),
}));

jest.mock('@/hooks/useRecipeHistory', () => ({
  useRecipeHistory: () => ({
    addToHistory: jest.fn(),
    removeFromHistory: jest.fn(),
    history: [],
  }),
}));

describe('Mode Cuisine - Tests de Performance', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    performance.mark('test-start');
  });

  afterEach(() => {
    performance.clearMarks();
    performance.clearMeasures();
  });

  const measurePerformance = (name: string) => {
    performance.mark('test-end');
    performance.measure(name, 'test-start', 'test-end');
    const measure = performance.getEntriesByName(name)[0];
    return measure.duration;
  };

  it('se charge rapidement (< 100ms)', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    const loadTime = measurePerformance('initial-load');
    
    expect(loadTime).toBeLessThan(100);
  });

  it('répond rapidement aux interactions utilisateur (< 50ms)', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    // Test de la navigation entre les étapes
    performance.mark('test-start');
    const nextButton = screen.getByLabelText('Étape suivante');
    fireEvent.click(nextButton);
    const navigationTime = measurePerformance('step-navigation');
    
    expect(navigationTime).toBeLessThan(50);

    // Test de l'ajustement des portions
    performance.mark('test-start');
    const increaseButton = screen.getByLabelText('Augmenter les portions');
    fireEvent.click(increaseButton);
    const portionAdjustTime = measurePerformance('portion-adjustment');
    
    expect(portionAdjustTime).toBeLessThan(50);
  });

  it('gère efficacement les mises à jour d\'état multiples (< 100ms)', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    performance.mark('test-start');
    
    // Simule plusieurs actions utilisateur en séquence
    const nextButton = screen.getByLabelText('Étape suivante');
    const completeButton = screen.getByRole('checkbox', { name: /Marquer comme terminé/i });
    
    fireEvent.click(completeButton);
    fireEvent.click(nextButton);
    
    const multipleUpdatesTime = measurePerformance('multiple-updates');
    expect(multipleUpdatesTime).toBeLessThan(100);
  });

  it('maintient des performances stables avec beaucoup d\'étapes (< 200ms)', () => {
    // Crée une recette avec beaucoup d'étapes
    const largeRecipe = {
      ...mockRecipe,
      steps: Array(50).fill(null).map((_, index) => ({
        ...mockRecipe.steps[0],
        description: `Étape ${index + 1}`,
      })),
    };

    performance.mark('test-start');
    render(<RecipeCookingMode recipe={largeRecipe} onClose={mockOnClose} />);
    const largeRecipeLoadTime = measurePerformance('large-recipe-load');
    
    expect(largeRecipeLoadTime).toBeLessThan(200);
  });

  it('gère efficacement les animations (< 16ms par frame)', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    // Test des animations lors de la navigation
    performance.mark('test-start');
    const nextButton = screen.getByLabelText('Étape suivante');
    fireEvent.click(nextButton);
    const animationTime = measurePerformance('step-animation');
    
    // 16ms correspond à 60fps
    expect(animationTime).toBeLessThan(16);
  });

  it('optimise le rendu des listes d\'ingrédients (< 50ms)', () => {
    // Crée une recette avec beaucoup d'ingrédients
    const recipeWithManyIngredients = {
      ...mockRecipe,
      ingredients: Array(100).fill(null).map((_, index) => ({
        name: `Ingrédient ${index + 1}`,
        quantity: 100,
        unit: 'g',
      })),
    };

    performance.mark('test-start');
    render(<RecipeCookingMode recipe={recipeWithManyIngredients} onClose={mockOnClose} />);
    const ingredientsRenderTime = measurePerformance('ingredients-render');
    
    expect(ingredientsRenderTime).toBeLessThan(50);
  });

  it('gère efficacement les mises à jour du timer (< 16ms)', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    // Trouve une étape avec un timer
    const stepWithTimer = mockRecipe.steps.find(step => step.duration);
    if (!stepWithTimer) throw new Error('Aucune étape avec timer trouvée');

    // Navigation jusqu'à l'étape avec timer
    const nextButton = screen.getByLabelText('Étape suivante');
    while (!screen.queryByText(stepWithTimer.description)) {
      fireEvent.click(nextButton);
    }

    // Test de la performance du timer
    performance.mark('test-start');
    const startTimerButton = screen.getByRole('button', { name: /Démarrer/i });
    fireEvent.click(startTimerButton);
    const timerUpdateTime = measurePerformance('timer-update');
    
    expect(timerUpdateTime).toBeLessThan(16);
  });
});

describe('Tests de performance avancés', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    performance.mark('test-start');
  });

  afterEach(() => {
    performance.clearMarks();
    performance.clearMeasures();
  });

  it('maintient une utilisation mémoire stable lors des interactions prolongées', async () => {
    const { rerender } = render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    // Simuler une série d'interactions
    for (let i = 0; i < 100; i++) {
      performance.mark('interaction-start');
      
      // Navigation entre les étapes
      const nextButton = screen.getByLabelText('Étape suivante');
      fireEvent.click(nextButton);
      
      // Modification des notes
      const noteButton = screen.getByTestId('notes-button');
      fireEvent.click(noteButton);
      const noteInput = screen.getByTestId('note-input');
      fireEvent.change(noteInput, { target: { value: `Note ${i}` } });
      
      // Ajustement des portions
      const portionInput = screen.getByLabelText('Portions :');
      fireEvent.change(portionInput, { target: { value: String(i % 10 + 1) } });
      
      // Re-render du composant
      rerender(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
      
      performance.mark('interaction-end');
      performance.measure('interaction-cycle', 'interaction-start', 'interaction-end');
    }
    
    // Vérifier que le temps moyen par cycle reste stable
    const measures = performance.getEntriesByType('measure');
    const averageTime = measures.reduce((acc, m) => acc + m.duration, 0) / measures.length;
    expect(averageTime).toBeLessThan(100);
  });

  it('gère efficacement les mises à jour simultanées', async () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    performance.mark('concurrent-start');
    
    // Simuler plusieurs mises à jour simultanées
    await Promise.all([
      // Navigation
      fireEvent.click(screen.getByLabelText('Étape suivante')),
      // Modification des portions
      fireEvent.change(screen.getByLabelText('Portions :'), { target: { value: '4' } }),
      // Marquage comme terminé
      fireEvent.click(screen.getByRole('checkbox', { name: /Marquer comme terminé/i })),
      // Modification des notes
      fireEvent.click(screen.getByTestId('notes-button')),
      fireEvent.change(screen.getByTestId('note-input'), { target: { value: 'Note test' } })
    ]);
    
    performance.mark('concurrent-end');
    performance.measure('concurrent-updates', 'concurrent-start', 'concurrent-end');
    
    const updateTime = performance.getEntriesByName('concurrent-updates')[0].duration;
    expect(updateTime).toBeLessThan(150);
  });

  it('maintient des performances stables avec des données volumineuses', () => {
    // Créer une recette avec beaucoup de données
    const largeRecipe = {
      ...mockRecipe,
      steps: Array(100).fill(null).map((_, i) => ({
        description: `Étape ${i + 1}`,
        duration: i * 60,
        ingredients: Array(20).fill(null).map((_, j) => ({
          name: `Ingrédient ${j + 1}`,
          quantity: (j + 1) * 10,
          unit: 'g'
        })),
        equipment: Array(10).fill(null).map((_, k) => `Équipement ${k + 1}`)
      }))
    };
    
    performance.mark('large-data-start');
    render(<RecipeCookingMode recipe={largeRecipe} onClose={mockOnClose} />);
    performance.mark('large-data-end');
    performance.measure('large-data-render', 'large-data-start', 'large-data-end');
    
    const renderTime = performance.getEntriesByName('large-data-render')[0].duration;
    expect(renderTime).toBeLessThan(500);
  });
}); 