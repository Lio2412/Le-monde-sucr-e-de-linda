import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/SearchBar';

const mockRouter = {
  push: jest.fn(),
  query: {},
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();
  const mockOnSuggestionSelect = jest.fn();
  
  const defaultProps = {
    onSearch: mockOnSearch,
    onSuggestionSelect: mockOnSuggestionSelect,
    suggestions: [],
    recentSearches: [],
    categories: ['Desserts', 'Plats principaux'],
    placeholder: 'Rechercher une recette...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<SearchBar {...defaultProps} />);
    expect(screen.getByPlaceholderText('Rechercher une recette...')).toBeInTheDocument();
  });

  it('handles user input correctly', async () => {
    render(<SearchBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Rechercher une recette...');
    await userEvent.type(input, 'gâteau');
    expect(input).toHaveValue('gâteau');
  });

  it('calls onSearch when submitting the form', async () => {
    render(<SearchBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Rechercher une recette...');
    await userEvent.type(input, 'gâteau{enter}');
    expect(mockOnSearch).toHaveBeenCalledWith('gâteau', {});
  });

  it('shows suggestions when typing', async () => {
    const suggestions = [
      { id: '1', title: 'Gâteau au chocolat', type: 'recipe' as const },
      { id: '2', title: 'Gâteau à la vanille', type: 'recipe' as const }
    ];
    render(<SearchBar {...defaultProps} suggestions={suggestions} />);
    const input = screen.getByPlaceholderText('Rechercher une recette...');
    await userEvent.type(input, 'gâteau');
    expect(screen.getByText('Gâteau au chocolat')).toBeInTheDocument();
    expect(screen.getByText('Gâteau à la vanille')).toBeInTheDocument();
  });

  it('handles suggestion selection', async () => {
    const suggestions = [
      { id: '1', title: 'Gâteau au chocolat', type: 'recipe' as const }
    ];
    render(<SearchBar {...defaultProps} suggestions={suggestions} />);
    const input = screen.getByPlaceholderText('Rechercher une recette...');
    await userEvent.type(input, 'gâteau');
    const suggestion = screen.getByText('Gâteau au chocolat');
    fireEvent.click(suggestion);
    expect(mockOnSuggestionSelect).toHaveBeenCalledWith(suggestions[0]);
  });

  it('handles category filters correctly', async () => {
    render(<SearchBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Rechercher une recette...');
    
    // Ouvrir les filtres
    const filterButton = screen.getByRole('button', { name: /filtres/i });
    fireEvent.click(filterButton);
    
    // Sélectionner une catégorie
    const dessertCategory = screen.getByText('Desserts');
    fireEvent.click(dessertCategory);
    
    await userEvent.type(input, 'gâteau{enter}');
    expect(mockOnSearch).toHaveBeenCalledWith('gâteau', { category: 'Desserts' });
  });

  it('handles errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<SearchBar {...defaultProps} />);
    
    // Simuler une erreur lors de la recherche
    mockOnSearch.mockRejectedValueOnce(new Error('Erreur de recherche'));
    
    const input = screen.getByPlaceholderText('Rechercher une recette...');
    await userEvent.type(input, 'test{enter}');
    
    await waitFor(() => {
      expect(screen.getByText(/erreur/i)).toBeInTheDocument();
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('clears input on suggestion selection', async () => {
    const suggestions = [
      { id: '1', title: 'Gâteau au chocolat', type: 'recipe' as const }
    ];
    render(<SearchBar {...defaultProps} suggestions={suggestions} />);
    const input = screen.getByPlaceholderText('Rechercher une recette...');
    
    await userEvent.type(input, 'gâteau');
    const suggestion = screen.getByText('Gâteau au chocolat');
    fireEvent.click(suggestion);
    
    expect(input).toHaveValue('');
  });
});
