import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeCard from '@/components/recipe/RecipeCard';

describe('RecipeCard Component', () => {
  const mockRecipe = {
    id: '1',
    title: 'Gâteau au Chocolat',
    description: 'Un délicieux gâteau au chocolat',
    prepTime: 30,
    difficulty: 'facile',
    image: '/images/gateau-chocolat.jpg',
    category: 'Desserts'
  };

  it('renders recipe information correctly', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    
    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument();
    expect(screen.getByText(mockRecipe.description)).toBeInTheDocument();
    expect(screen.getByText(`${mockRecipe.prepTime} min`)).toBeInTheDocument();
    expect(screen.getByText(mockRecipe.difficulty)).toBeInTheDocument();
  });

  it('displays recipe image with correct alt text', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockRecipe.image);
    expect(image).toHaveAttribute('alt', mockRecipe.title);
  });

  it('navigates to recipe detail page on click', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    const card = screen.getByRole('link');
    expect(card).toHaveAttribute('href', `/recettes/${mockRecipe.id}`);
  });

  it('displays recipe category badge', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText(mockRecipe.category)).toBeInTheDocument();
  });

  it('handles missing image gracefully', () => {
    const recipeWithoutImage = { ...mockRecipe, image: undefined };
    render(<RecipeCard recipe={recipeWithoutImage} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/images/default-recipe.jpg');
  });

  it('truncates long descriptions', () => {
    const recipeWithLongDesc = {
      ...mockRecipe,
      description: 'a'.repeat(200)
    };
    render(<RecipeCard recipe={recipeWithLongDesc} />);
    expect(screen.getByText(/\.{3}$/)).toBeInTheDocument();
  });
});
