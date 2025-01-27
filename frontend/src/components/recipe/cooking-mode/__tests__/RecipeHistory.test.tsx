import { render, screen, fireEvent } from '@testing-library/react';
import RecipeHistory from '../RecipeHistory';
import { useRecipeHistory } from '@/hooks/useRecipeHistory';

// Mock du hook useRecipeHistory
jest.mock('@/hooks/useRecipeHistory');

describe('RecipeHistory', () => {
  const mockHistory = [
    {
      id: '1',
      title: 'Tarte aux pommes',
      slug: 'tarte-aux-pommes',
      lastVisited: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Gâteau au chocolat',
      slug: 'gateau-au-chocolat',
      lastVisited: new Date().toISOString()
    }
  ];

  const mockClearHistory = jest.fn();

  beforeEach(() => {
    (useRecipeHistory as jest.Mock).mockReturnValue({
      history: mockHistory,
      clearHistory: mockClearHistory
    });
  });

  it('devrait afficher un message quand l\'historique est vide', () => {
    (useRecipeHistory as jest.Mock).mockReturnValue({
      history: [],
      clearHistory: mockClearHistory
    });

    render(<RecipeHistory />);
    expect(screen.getByText('Aucune recette dans l\'historique')).toBeInTheDocument();
  });

  it('devrait afficher la liste des recettes de l\'historique', () => {
    render(<RecipeHistory />);

    expect(screen.getByText('Tarte aux pommes')).toBeInTheDocument();
    expect(screen.getByText('Gâteau au chocolat')).toBeInTheDocument();
  });

  it('devrait afficher le titre "Historique des recettes"', () => {
    render(<RecipeHistory />);
    expect(screen.getByText('Historique des recettes')).toBeInTheDocument();
  });

  it('devrait avoir un bouton pour effacer l\'historique', () => {
    render(<RecipeHistory />);
    
    const clearButton = screen.getByText('Effacer l\'historique');
    expect(clearButton).toBeInTheDocument();
    
    fireEvent.click(clearButton);
    expect(mockClearHistory).toHaveBeenCalled();
  });

  it('devrait avoir des liens vers les recettes', () => {
    render(<RecipeHistory />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(mockHistory.length);
    expect(links[0]).toHaveAttribute('href', '/recettes/tarte-aux-pommes');
    expect(links[1]).toHaveAttribute('href', '/recettes/gateau-au-chocolat');
  });

  it('devrait afficher le temps écoulé depuis la dernière visite', () => {
    render(<RecipeHistory />);
    
    // Vérifie que la date relative est affichée (le texte exact dépendra de la date)
    expect(screen.getAllByText(/il y a/i)).toHaveLength(mockHistory.length);
  });
}); 