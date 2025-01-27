import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreparationMode } from '../PreparationMode';
import { Recipe } from '@/types/recipe';

describe('PreparationMode', () => {
  const mockRecipe: Recipe = {
    id: '1',
    title: 'Tarte aux pommes',
    description: 'Une délicieuse tarte aux pommes traditionnelle',
    preparationTime: 30,
    cookingTime: 45,
    servings: 6,
    difficulty: 'moyen',
    category: 'Desserts',
    slug: 'tarte-aux-pommes',
    tags: ['dessert', 'pommes', 'pâtisserie'],
    steps: [
      { description: 'Préchauffer le four', duration: 0 },
      { description: 'Préparer la pâte', duration: 15 }
    ],
    ingredients: [
      { name: 'Pommes', quantity: 6, unit: 'pièces' },
      { name: 'Farine', quantity: 250, unit: 'g' }
    ],
    equipment: [
      'Four',
      'Moule à tarte',
      'Rouleau à pâtisserie'
    ]
  };

  const mockOnStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher le temps total de préparation', () => {
    render(<PreparationMode recipe={mockRecipe} onStart={mockOnStart} />);
    expect(screen.getByText('Temps total : 75 minutes')).toBeInTheDocument();
  });

  it('devrait afficher la liste des ingrédients', () => {
    render(<PreparationMode recipe={mockRecipe} onStart={mockOnStart} />);
    expect(screen.getByText('Ingrédients nécessaires')).toBeInTheDocument();
    expect(screen.getByText(/6 pièces Pommes/)).toBeInTheDocument();
    expect(screen.getByText(/250 g Farine/)).toBeInTheDocument();
  });

  it('devrait afficher la liste des équipements', () => {
    render(<PreparationMode recipe={mockRecipe} onStart={mockOnStart} />);
    expect(screen.getByText('Équipements recommandés')).toBeInTheDocument();
    expect(screen.getByText('Four')).toBeInTheDocument();
    expect(screen.getByText('Moule à tarte')).toBeInTheDocument();
    expect(screen.getByText('Rouleau à pâtisserie')).toBeInTheDocument();
  });

  it('devrait appeler onStart quand le bouton est cliqué', async () => {
    const user = userEvent.setup({ delay: null });
    render(<PreparationMode recipe={mockRecipe} onStart={mockOnStart} />);
    
    const startButton = screen.getByRole('button', { name: /commencer la recette/i });
    await user.click(startButton);
    
    expect(mockOnStart).toHaveBeenCalled();
  });
}); 