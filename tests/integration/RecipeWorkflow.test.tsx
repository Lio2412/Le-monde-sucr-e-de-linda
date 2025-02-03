import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from 'next-auth/react';
import RecipeList from '@/components/recipe/RecipeList';
import RecipeDetail from '@/components/recipe/RecipeDetail';
import RecipeForm from '@/components/recipe/RecipeForm';

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn()
}));

describe('Recipe Workflow Integration', () => {
  const mockSession = {
    data: {
      user: { id: '1', name: 'Test User', email: 'test@example.com' }
    },
    status: 'authenticated'
  };

  beforeEach(() => {
    global.fetch = jest.fn();
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/recipes')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: '1',
              title: 'Gâteau au Chocolat',
              description: 'Délicieux gâteau',
              ingredients: ['chocolat', 'farine', 'oeufs'],
              steps: ['Mélanger', 'Cuire'],
              prepTime: 30,
              difficulty: 'facile'
            }
          ])
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('completes full recipe creation and viewing workflow', async () => {
    // 1. Affichage de la liste des recettes
    render(
      <SessionProvider session={mockSession}>
        <RecipeList />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Gâteau au Chocolat')).toBeInTheDocument();
    });

    // 2. Création d'une nouvelle recette
    render(
      <SessionProvider session={mockSession}>
        <RecipeForm />
      </SessionProvider>
    );

    await userEvent.type(screen.getByLabelText(/titre/i), 'Tarte aux Pommes');
    await userEvent.type(screen.getByLabelText(/description/i), 'Une délicieuse tarte');
    await userEvent.type(screen.getByLabelText(/temps de préparation/i), '45');
    await userEvent.selectOptions(screen.getByLabelText(/difficulté/i), 'moyen');

    const addIngredientButton = screen.getByText(/ajouter un ingrédient/i);
    fireEvent.click(addIngredientButton);
    await userEvent.type(screen.getByTestId('ingredient-input-0'), 'pommes');

    const addStepButton = screen.getByText(/ajouter une étape/i);
    fireEvent.click(addStepButton);
    await userEvent.type(screen.getByTestId('step-input-0'), 'Éplucher les pommes');

    const submitButton = screen.getByRole('button', { name: /sauvegarder/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/recette créée avec succès/i)).toBeInTheDocument();
    });

    // 3. Visualisation de la recette
    render(
      <SessionProvider session={mockSession}>
        <RecipeDetail recipeId="2" />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tarte aux Pommes')).toBeInTheDocument();
      expect(screen.getByText('Une délicieuse tarte')).toBeInTheDocument();
      expect(screen.getByText('45 minutes')).toBeInTheDocument();
      expect(screen.getByText('pommes')).toBeInTheDocument();
      expect(screen.getByText('Éplucher les pommes')).toBeInTheDocument();
    });
  });

  it('handles recipe search and filtering', async () => {
    render(
      <SessionProvider session={mockSession}>
        <RecipeList />
      </SessionProvider>
    );

    // Recherche
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    await userEvent.type(searchInput, 'chocolat');

    await waitFor(() => {
      expect(screen.getByText('Gâteau au Chocolat')).toBeInTheDocument();
    });

    // Filtrage par catégorie
    const filterSelect = screen.getByLabelText(/catégorie/i);
    await userEvent.selectOptions(filterSelect, 'Desserts');

    await waitFor(() => {
      expect(screen.getByText('Gâteau au Chocolat')).toBeInTheDocument();
    });
  });

  it('handles recipe comments and ratings', async () => {
    render(
      <SessionProvider session={mockSession}>
        <RecipeDetail recipeId="1" />
      </SessionProvider>
    );

    // Ajout d'un commentaire
    const commentInput = screen.getByLabelText(/commentaire/i);
    await userEvent.type(commentInput, 'Excellent gâteau !');

    const submitComment = screen.getByRole('button', { name: /publier/i });
    fireEvent.click(submitComment);

    await waitFor(() => {
      expect(screen.getByText('Excellent gâteau !')).toBeInTheDocument();
    });

    // Attribution d'une note
    const ratingStars = screen.getAllByRole('button', { name: /étoile/i });
    fireEvent.click(ratingStars[4]); // 5 étoiles

    await waitFor(() => {
      expect(screen.getByText(/note moyenne/i)).toHaveTextContent('5');
    });
  });
});
