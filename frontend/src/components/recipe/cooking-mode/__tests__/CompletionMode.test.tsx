/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompletionMode } from '../RecipeCookingMode';
import { mockRecipe } from '@/mocks/recipe';

describe('CompletionMode', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('affiche les félicitations avec le titre de la recette', () => {
    render(<CompletionMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    expect(screen.getByText('Félicitations !')).toBeInTheDocument();
    expect(screen.getByText(/Vous avez terminé la recette/)).toBeInTheDocument();
    expect(screen.getByText(mockRecipe.title, { exact: false })).toBeInTheDocument();
  });

  it('affiche le message pour prendre une photo', () => {
    render(<CompletionMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    expect(screen.getByText(/N'oubliez pas de prendre une photo/)).toBeInTheDocument();
  });

  it('appelle onClose quand le bouton Terminer est cliqué', () => {
    render(<CompletionMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    const terminerButton = screen.getByText('Terminer');
    fireEvent.click(terminerButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('affiche les icônes de célébration', () => {
    render(<CompletionMode recipe={mockRecipe} onClose={mockOnClose} />);
    
    // Vérifier que les icônes sont présentes en utilisant leur rôle
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons).toHaveLength(2); // PartyPopper et Trophy
  });
}); 