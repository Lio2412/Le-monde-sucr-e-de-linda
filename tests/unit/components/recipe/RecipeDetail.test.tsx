import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeDetail from '@/components/recipe/RecipeDetail';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

describe('RecipeDetail Component', () => {
  const mockRecipe = {
    id: '1',
    title: 'Gâteau au Chocolat',
    description: 'Un délicieux gâteau au chocolat',
    ingredients: [
      { id: '1', name: 'Chocolat noir', quantity: '200', unit: 'g' },
      { id: '2', name: 'Farine', quantity: '150', unit: 'g' },
      { id: '3', name: 'Oeufs', quantity: '3', unit: 'unités' }
    ],
    steps: [
      { id: '1', description: 'Faire fondre le chocolat', order: 1 },
      { id: '2', description: 'Mélanger avec la farine', order: 2 },
      { id: '3', description: 'Ajouter les oeufs', order: 3 }
    ],
    prepTime: 30,
    cookTime: 25,
    difficulty: 'facile',
    servings: 8,
    image: '/images/gateau-chocolat.jpg',
    author: {
      id: '1',
      name: 'Linda',
      image: '/images/linda.jpg'
    },
    createdAt: new Date('2025-01-01').toISOString(),
    category: 'Desserts'
  };

  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    mockUseSession.mockClear();
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });
  });

  it('renders recipe details correctly', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    
    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument();
    expect(screen.getByText(mockRecipe.description)).toBeInTheDocument();
    expect(screen.getByText(`${mockRecipe.prepTime} min`)).toBeInTheDocument();
    expect(screen.getByText(`${mockRecipe.cookTime} min`)).toBeInTheDocument();
    expect(screen.getByText(mockRecipe.difficulty)).toBeInTheDocument();
    expect(screen.getByText(`${mockRecipe.servings} portions`)).toBeInTheDocument();
  });

  it('displays all ingredients correctly', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    
    mockRecipe.ingredients.forEach(ingredient => {
      expect(screen.getByText(ingredient.name)).toBeInTheDocument();
      expect(screen.getByText(`${ingredient.quantity} ${ingredient.unit}`)).toBeInTheDocument();
    });
  });

  it('displays all steps in correct order', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    
    mockRecipe.steps.forEach(step => {
      expect(screen.getByText(step.description)).toBeInTheDocument();
      expect(screen.getByText(`${step.order}.`)).toBeInTheDocument();
    });
  });

  it('shows edit button when user is author', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', name: 'Linda' }
      },
      status: 'authenticated'
    });

    render(<RecipeDetail recipe={mockRecipe} />);
    expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument();
  });

  it('hides edit button when user is not author', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '2', name: 'Other User' }
      },
      status: 'authenticated'
    });

    render(<RecipeDetail recipe={mockRecipe} />);
    expect(screen.queryByRole('button', { name: /modifier/i })).not.toBeInTheDocument();
  });

  it('allows servings adjustment', async () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    
    const increaseButton = screen.getByRole('button', { name: /augmenter portions/i });
    fireEvent.click(increaseButton);

    await waitFor(() => {
      expect(screen.getByText('10 portions')).toBeInTheDocument();
      // Vérifier que les quantités d'ingrédients ont été ajustées
      expect(screen.getByText('250 g')).toBeInTheDocument(); // Chocolat ajusté
    });
  });

  it('displays recipe image with correct alt text', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    const image = screen.getByRole('img', { name: mockRecipe.title });
    expect(image).toHaveAttribute('src', mockRecipe.image);
    expect(image).toHaveAttribute('alt', mockRecipe.title);
  });

  it('shows print button and handles print action', () => {
    const mockPrint = jest.fn();
    window.print = mockPrint;

    render(<RecipeDetail recipe={mockRecipe} />);
    const printButton = screen.getByRole('button', { name: /imprimer/i });
    
    fireEvent.click(printButton);
    expect(mockPrint).toHaveBeenCalled();
  });

  it('displays author information', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    
    expect(screen.getByText(mockRecipe.author.name)).toBeInTheDocument();
    const authorImage = screen.getByRole('img', { name: mockRecipe.author.name });
    expect(authorImage).toHaveAttribute('src', mockRecipe.author.image);
  });

  it('shows creation date in correct format', () => {
    render(<RecipeDetail recipe={mockRecipe} />);
    
    const date = new Date(mockRecipe.createdAt);
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
    
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });
});
