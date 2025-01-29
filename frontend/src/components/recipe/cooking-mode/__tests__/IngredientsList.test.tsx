import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IngredientsList } from '../IngredientsList';
import { Ingredient } from '@/types/recipe';

const mockIngredients: Ingredient[] = [
  { name: 'Farine', quantity: 250, unit: 'g' },
  { name: 'Sucre', quantity: 100, unit: 'g' },
  { name: 'Oeufs', quantity: 3, unit: 'pièces' },
];

describe('IngredientsList', () => {
  it('affiche correctement la liste des ingrédients', () => {
    render(<IngredientsList ingredients={mockIngredients} defaultServings={4} />);
    
    mockIngredients.forEach(ingredient => {
      const ingredientElement = screen.getByTestId(`ingredient-${ingredient.name}`);
      expect(ingredientElement).toBeInTheDocument();
      expect(screen.getByText(ingredient.name)).toBeInTheDocument();
      expect(screen.getByText(`${ingredient.quantity}${ingredient.unit}`)).toBeInTheDocument();
    });
  });

  it('met à jour les quantités en fonction du nombre de portions', () => {
    const newServings = 8; // Double des portions initiales
    render(<IngredientsList ingredients={mockIngredients} defaultServings={newServings} />);
    
    mockIngredients.forEach(ingredient => {
      const expectedQuantity = ingredient.quantity * (newServings / 4);
      expect(screen.getByText(`${expectedQuantity}${ingredient.unit}`)).toBeInTheDocument();
    });
  });

  it('affiche des tooltips au survol des ingrédients', async () => {
    render(<IngredientsList ingredients={mockIngredients} defaultServings={4} />);
    
    for (const ingredient of mockIngredients) {
      const ingredientElement = screen.getByTestId(`ingredient-${ingredient.name}`);
      
      // Simule le survol
      await userEvent.hover(ingredientElement);
      
      // Vérifie que le tooltip est affiché
      const tooltip = await screen.findByText(`Ingrédient requis : ${ingredient.name}`, {}, { timeout: 1000 });
      expect(tooltip).toBeInTheDocument();
      
      // Simule le départ de la souris
      await userEvent.unhover(ingredientElement);
      expect(tooltip).not.toBeVisible();
    }
  });

  it('applique les styles appropriés aux éléments de la liste', () => {
    render(<IngredientsList ingredients={mockIngredients} defaultServings={4} />);
    
    const list = screen.getByTestId('ingredients-list');
    expect(list).toHaveClass('space-y-2');
    
    mockIngredients.forEach(ingredient => {
      const ingredientElement = screen.getByTestId(`ingredient-${ingredient.name}`);
      expect(ingredientElement).toHaveClass('flex', 'items-center', 'gap-3', 'p-2', 'rounded-md');
    });
  });

  it('gère correctement les ingrédients sans unité', () => {
    const ingredientsWithoutUnit = [
      { name: 'Sel', quantity: 1, unit: '' },
      { name: 'Poivre', quantity: 1, unit: '' }
    ];
    
    render(<IngredientsList ingredients={ingredientsWithoutUnit} defaultServings={4} />);
    
    ingredientsWithoutUnit.forEach(ingredient => {
      const ingredientElement = screen.getByTestId(`ingredient-${ingredient.name}`);
      expect(ingredientElement).toBeInTheDocument();
      expect(screen.getByText(ingredient.name)).toBeInTheDocument();
      expect(screen.getByText(`${ingredient.quantity}`)).toBeInTheDocument();
    });
  });

  it('gère correctement les ingrédients avec des quantités décimales', () => {
    const ingredientsWithDecimals = [
      { name: 'Levure', quantity: 0.5, unit: 'g' },
      { name: 'Vanille', quantity: 1.5, unit: 'ml' }
    ];
    
    render(<IngredientsList ingredients={ingredientsWithDecimals} defaultServings={4} />);
    
    ingredientsWithDecimals.forEach(ingredient => {
      const ingredientElement = screen.getByTestId(`ingredient-${ingredient.name}`);
      expect(ingredientElement).toBeInTheDocument();
      expect(screen.getByText(ingredient.name)).toBeInTheDocument();
      expect(screen.getByText(`${ingredient.quantity}${ingredient.unit}`)).toBeInTheDocument();
    });
  });
}); 