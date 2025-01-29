import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeCookingMode } from '../../RecipeCookingMode';
import { Recipe, RecipeStep } from '@/types/recipe';
import { renderWithProviders, clearMocks } from '@/test-utils/test-wrapper';
import { useFullscreen } from '@/hooks/useFullscreen';

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

jest.mock('@/hooks/useFullscreen', () => {
  const mockToggleFullscreen = jest.fn();
  return {
    useFullscreen: jest.fn(() => ({
      isFullscreen: false,
      toggleFullscreen: mockToggleFullscreen,
      isEnabled: true
    }))
  };
});

const mockRecipe: Recipe = {
  id: '1',
  title: 'Gâteau au chocolat',
  description: 'Un délicieux gâteau au chocolat',
  preparationTime: 30,
  cookingTime: 45,
  servings: 8,
  ingredients: [
    { name: 'Farine', quantity: 200, unit: 'g' },
    { name: 'Chocolat', quantity: 150, unit: 'g' }
  ],
  steps: [
    {
      description: 'Préchauffer le four à 180°C',
      duration: 0,
      equipment: ['Moule à gâteau', 'Fouet']
    } as RecipeStep,
    {
      description: 'Faire fondre le chocolat avec le beurre',
      duration: 300,
      equipment: ['Saladier']
    } as RecipeStep
  ],
  category: 'Dessert',
  difficulty: 'moyen',
  slug: 'gateau-au-chocolat',
  tags: ['Chocolat', 'Dessert', 'Four'],
  equipment: ['Four', 'Moule à gâteau', 'Saladier', 'Fouet']
};

describe('Mode Cuisine - Tests d\'intégration', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
    clearMocks();
    
    // Mock de l'API Fullscreen
    Object.defineProperty(document, 'fullscreenEnabled', {
      writable: true,
      value: true,
    });

    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null,
    });

    document.documentElement.requestFullscreen = jest.fn().mockResolvedValue(undefined);
    document.exitFullscreen = jest.fn().mockResolvedValue(undefined);
  });

  it('permet de naviguer entre les étapes', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Vérifier l'étape initiale
    await waitFor(() => {
      const stepDescription = screen.getByTestId('step-description');
      expect(stepDescription).toHaveTextContent('Préchauffer le four à 180°C');
    });

    // Naviguer à l'étape suivante
    const nextButton = screen.getByTestId('next-step-button');
    fireEvent.click(nextButton);

    // Vérifier l'étape suivante
    await waitFor(() => {
      const stepDescription = screen.getByTestId('step-description');
      expect(stepDescription).toHaveTextContent('Faire fondre le chocolat avec le beurre');
    });

    // Revenir à l'étape précédente
    const previousButton = screen.getByTestId('previous-step-button');
    fireEvent.click(previousButton);

    // Vérifier le retour à l'étape précédente
    await waitFor(() => {
      const stepDescription = screen.getByTestId('step-description');
      expect(stepDescription).toHaveTextContent('Préchauffer le four à 180°C');
    });
  });

  it('gère correctement le minuteur', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Aller à l'étape avec le timer (étape 2)
    const nextButton = screen.getByTestId('next-step-button');
    fireEvent.click(nextButton);

    // Attendre que l'étape avec le timer soit affichée
    await waitFor(() => {
      const stepDescription = screen.getByTestId('step-description');
      expect(stepDescription).toHaveTextContent('Faire fondre le chocolat avec le beurre');
    });

    // Démarrer le minuteur
    const timerButton = screen.getByTestId('timer-toggle');
    expect(timerButton).toHaveAttribute('aria-label', 'Démarrer');
    fireEvent.click(timerButton);

    // Vérifier que le minuteur est en cours
    await waitFor(() => {
      const updatedTimerButton = screen.getByTestId('timer-toggle');
      expect(updatedTimerButton).toHaveAttribute('aria-label', 'Arrêter');
    });

    // Arrêter le minuteur
    const pauseButton = screen.getByTestId('timer-toggle');
    fireEvent.click(pauseButton);

    // Vérifier que le minuteur est en pause
    expect(screen.getByTestId('timer-toggle')).toHaveAttribute('aria-label', 'Démarrer');
  });

  it('gère correctement le mode plein écran', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Vérifier que le bouton plein écran est présent
    const fullscreenButton = screen.getByTestId('fullscreen-toggle');
    expect(fullscreenButton).toBeInTheDocument();

    // Activer le mode plein écran
    fireEvent.click(fullscreenButton);

    // Vérifier que la fonction toggleFullscreen a été appelée
    const { useFullscreen } = require('@/hooks/useFullscreen');
    expect(useFullscreen().toggleFullscreen).toHaveBeenCalled();
  });

  it('permet d\'ajouter et consulter des notes', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Ouvrir le dialogue des notes
    const noteButton = screen.getByTestId('toggle-notes-button');
    fireEvent.click(noteButton);

    // Ajouter une note
    const noteInput = screen.getByTestId('note-input');
    await userEvent.type(noteInput, 'Test note');

    // Vérifier que la note est sauvegardée
    expect(noteInput).toHaveValue('Test note');
  });

  it('affiche correctement la progression de la recette', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Vérifier l'affichage initial de la progression
    const progressElement = screen.getByTestId('recipe-progress');
    expect(progressElement).toHaveTextContent('Progression : 0%');

    // Marquer la première étape comme complétée
    const completeButton = screen.getByRole('checkbox', { name: /Marquer comme terminé/i });
    fireEvent.click(completeButton);

    // Vérifier la mise à jour de la progression
    expect(progressElement).toHaveTextContent(`Progression : ${Math.round(100 / mockRecipe.steps.length)}%`);
  });

  it('demande confirmation avant de quitter avec des changements', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Marquer une étape comme terminée
    const completeButton = screen.getByRole('checkbox', { name: /Marquer comme terminé/i });
    fireEvent.click(completeButton);

    // Cliquer sur le bouton de fermeture
    const closeButton = screen.getByTestId('close-cooking-mode-button');
    fireEvent.click(closeButton);

    // Vérifier que la boîte de dialogue de confirmation est affichée
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveTextContent('Êtes-vous sûr de vouloir quitter le mode cuisine ?');
    });

    // Confirmer la sortie
    const confirmButton = screen.getByRole('button', { name: /Quitter/i });
    fireEvent.click(confirmButton);

    // Vérifier que onClose a été appelé
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('synchronise correctement les notes entre les étapes', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Ouvrir le dialogue des notes
    const noteButton = screen.getByTestId('toggle-notes-button');
    fireEvent.click(noteButton);

    // Ajouter une note à l'étape actuelle
    const noteInput = screen.getByTestId('note-input');
    await userEvent.type(noteInput, 'Note pour étape 1');

    // Aller à l'étape suivante
    const nextButton = screen.getByTestId('next-step-button');
    fireEvent.click(nextButton);

    // Ajouter une note à l'étape 2
    await userEvent.type(noteInput, 'Note pour étape 2');

    // Revenir à l'étape précédente
    const previousButton = screen.getByTestId('previous-step-button');
    fireEvent.click(previousButton);

    // Vérifier que la note de l'étape 1 est toujours présente
    expect(noteInput).toHaveValue('Note pour étape 1');
  });
});

describe('RecipeCookingMode Integration', () => {
  // Test d'intégration pour la navigation entre les étapes
  test('navigue correctement entre les étapes avec les boutons et le clavier', async () => {
    const { getByText, getByTestId } = render(
      <RecipeCookingMode recipe={mockRecipe} onClose={jest.fn()} />
    );
    
    // Vérification étape initiale
    expect(getByText('Étape 1/2')).toBeInTheDocument();
    
    // Navigation via bouton suivant
    fireEvent.click(getByTestId('next-step-button'));
    expect(getByText('Étape 2/2')).toBeInTheDocument();
    
    // Navigation via bouton précédent
    fireEvent.click(getByTestId('prev-step-button'));
    expect(getByText('Étape 1/2')).toBeInTheDocument();
    
    // Navigation clavier
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(getByText('Étape 2/2')).toBeInTheDocument();
    
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(getByText('Étape 1/2')).toBeInTheDocument();
  });

  // Nouveau test pour la gestion des équipements
  test('affiche et permet de cocher les équipements', async () => {
    const { getByLabelText, getByText } = render(
      <RecipeCookingMode recipe={mockRecipe} onClose={jest.fn()} />
    );
    
    expect(getByText('Équipement requis :')).toBeInTheDocument();
    const equipmentCheckbox = getByLabelText('Moule à gâteau');
    fireEvent.click(equipmentCheckbox);
    expect(equipmentCheckbox).toBeChecked();
  });

  // Test pour l'adaptation des portions
  test('ajuste les quantités selon le nombre de portions', async () => {
    const { getByLabelText, getByText } = render(
      <RecipeCookingMode recipe={mockRecipe} onClose={jest.fn()} />
    );
    
    fireEvent.change(getByLabelText('Portions :'), { target: { value: '4' } });
    expect(getByText('800g')).toBeInTheDocument(); // 200g * 4
  });
});

// Nouveaux tests ajoutés
describe('Fonctionnalités avancées', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche correctement les raccourcis clavier', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Ouvrir le dialogue des raccourcis
    const shortcutsButton = screen.getByRole('button', { name: /Afficher les raccourcis clavier/i });
    fireEvent.click(shortcutsButton);

    // Vérifier que le dialogue est affiché
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('Raccourcis clavier');

    // Fermer le dialogue
    const closeButton = screen.getByRole('button', { name: /Fermer/i });
    fireEvent.click(closeButton);

    // Vérifier que le dialogue est fermé
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('marque les étapes comme complétées', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Marquer l'étape comme complétée
    const completeButton = screen.getByRole('checkbox', { name: /Marquer comme terminé/i });
    fireEvent.click(completeButton);

    // Vérifier que l'étape est marquée comme complétée
    expect(completeButton).toBeChecked();

    // Vérifier la mise à jour de la progression
    const progressElement = screen.getByTestId('recipe-progress');
    expect(progressElement).toHaveTextContent(`Progression : ${Math.round(100 / mockRecipe.steps.length)}%`);
  });

  it('synchronise correctement les notes entre les sessions', async () => {
    const { unmount } = renderWithProviders(
      <RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />
    );

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Ajouter une note
    const noteButton = screen.getByTestId('toggle-notes-button');
    fireEvent.click(noteButton);
    const noteInput = screen.getByTestId('note-input');
    await userEvent.type(noteInput, 'Note de test');

    // Fermer et rouvrir le composant
    unmount();

    // Deuxième session
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const newStartButton = screen.getByTestId('start-recipe');
    fireEvent.click(newStartButton);

    // Vérifier que la note est toujours présente
    const newNoteButton = screen.getByTestId('toggle-notes-button');
    fireEvent.click(newNoteButton);
    expect(screen.getByTestId('note-input')).toHaveValue('Note de test');
  });

  it('synchronise l\'état entre les différents onglets', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Passer en mode cuisine
    const startButton = screen.getByTestId('start-recipe');
    fireEvent.click(startButton);

    // Simuler un événement de stockage
    const storageEvent = new StorageEvent('storage', {
      key: `recipe-notes-${mockRecipe.id}`,
      newValue: JSON.stringify({ '0': 'Note synchronisée' }),
      storageArea: localStorage
    });

    // Déclencher l'événement de stockage
    window.dispatchEvent(storageEvent);

    // Vérifier que les notes sont synchronisées
    const noteButton = screen.getByTestId('toggle-notes-button');
    fireEvent.click(noteButton);
    expect(screen.getByTestId('note-input')).toHaveValue('Note synchronisée');
  });
});

// Tests de gestion des erreurs et d'accessibilité
describe('Gestion des erreurs et accessibilité', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gère correctement les erreurs de chargement des images', async () => {
    const recipeWithInvalidImage = {
      ...mockRecipe,
      images: [{ url: 'invalid-image-url.jpg', alt: 'Image invalide' }]
    };

    renderWithProviders(<RecipeCookingMode recipe={recipeWithInvalidImage} onClose={mockOnClose} />);

    // Vérifier que l'image de fallback est affichée
    const fallbackImage = await screen.findByAltText('Image invalide');
    expect(fallbackImage).toBeInTheDocument();
    expect(fallbackImage).toHaveAttribute('src', '/images/recipe-placeholder.jpg');
  });

  it('respecte les critères d\'accessibilité ARIA', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Vérifier les rôles et attributs ARIA
    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Mode cuisine');
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Navigation des étapes');
    
    // Vérifier les boutons de navigation
    const prevButton = screen.getByTestId('previous-step-button');
    const nextButton = screen.getByTestId('next-step-button');
    expect(prevButton).toHaveAttribute('aria-label', 'Étape précédente');
    expect(nextButton).toHaveAttribute('aria-label', 'Étape suivante');

    // Vérifier l'indicateur de progression
    const progress = screen.getByTestId('recipe-progress');
    expect(progress).toHaveAttribute('role', 'progressbar');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('gère correctement la navigation au clavier', async () => {
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Focus sur le premier élément interactif
    const firstInteractive = screen.getByTestId('close-cooking-mode-button');
    firstInteractive.focus();
    expect(document.activeElement).toBe(firstInteractive);

    // Navigation avec Tab
    userEvent.tab();
    expect(document.activeElement).toHaveAttribute('data-testid', 'previous-step-button');

    userEvent.tab();
    expect(document.activeElement).toHaveAttribute('data-testid', 'next-step-button');

    // Vérifier que tous les éléments interactifs sont accessibles au clavier
    const interactiveElements = screen.getAllByRole('button');
    interactiveElements.forEach(element => {
      element.focus();
      expect(document.activeElement).toBe(element);
    });
  });
});

// Tests de synchronisation des données
describe('Synchronisation des données', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('persiste correctement les notes entre les sessions', async () => {
    // Première session
    const { unmount } = renderWithProviders(
      <RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />
    );

    // Ajouter une note
    const noteButton = screen.getByTestId('notes-button');
    fireEvent.click(noteButton);
    const noteInput = screen.getByTestId('note-input');
    await userEvent.type(noteInput, 'Note de test');

    // Fermer et rouvrir le composant
    unmount();

    // Deuxième session
    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Vérifier que la note est toujours présente
    fireEvent.click(screen.getByTestId('notes-button'));
    expect(screen.getByTestId('note-input')).toHaveValue('Note de test');
  });

  it('synchronise l\'état entre les différents onglets', async () => {
    // Simuler un événement de stockage
    const storageEvent = new StorageEvent('storage', {
      key: `recipe-notes-${mockRecipe.id}`,
      newValue: JSON.stringify({ '0': 'Note synchronisée' }),
      storageArea: localStorage
    });

    renderWithProviders(<RecipeCookingMode recipe={mockRecipe} onClose={mockOnClose} />);

    // Déclencher l'événement de stockage
    window.dispatchEvent(storageEvent);

    // Vérifier que les notes sont synchronisées
    const noteButton = screen.getByTestId('notes-button');
    fireEvent.click(noteButton);
    expect(screen.getByTestId('note-input')).toHaveValue('Note synchronisée');
  });
}); 
