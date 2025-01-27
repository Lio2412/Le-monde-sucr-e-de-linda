import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCookingMode } from '@/components/recipe/cooking-mode/RecipeCookingMode';

// Mock des composants externes
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock de framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('RecipeCookingMode', () => {
  const mockRecipe = {
    id: '1',
    title: 'Gâteau au Chocolat',
    description: 'Un délicieux gâteau au chocolat',
    ingredients: [
      { name: 'Chocolat', quantity: 200, unit: 'g' }
    ],
    steps: [
      { description: 'Étape 1', duration: 10 },
      { description: 'Étape 2', duration: 15 }
    ],
    servings: 4,
    preparationTime: 30,
    cookingTime: 25,
    difficulty: 'facile' as const,
    category: 'Desserts',
    slug: 'gateau-chocolat',
    tags: ['chocolat']
  };

  it('affiche le titre de la recette', () => {
    render(<RecipeCookingMode recipe={mockRecipe} onClose={() => {}} />);
    expect(screen.getByText('Gâteau au Chocolat')).toBeInTheDocument();
  });
}); 