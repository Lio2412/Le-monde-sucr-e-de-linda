import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyboardShortcutsDialog } from '../KeyboardShortcutsDialog';

// Créer un wrapper pour le portail
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <div id="radix-portal" />
    </>
  );
};

const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders });
};

describe('KeyboardShortcutsDialog', () => {
  const mockShortcuts = {
    navigation: [
      { key: '→, N', description: 'Étape suivante' },
      { key: '←, P', description: 'Étape précédente' },
      { key: 'Esc', description: 'Quitter' },
    ],
    timer: [
      { key: 'Espace', description: 'Démarrer/Pause', enabled: true },
      { key: 'R', description: 'Réinitialiser', enabled: true },
    ],
    display: [
      { key: 'F', description: 'Plein écran' },
      { key: 'I', description: 'Afficher/Masquer les ingrédients' },
      { key: 'M', description: 'Marquer comme terminé' },
    ],
  };

  beforeEach(() => {
    // Réinitialiser le DOM entre chaque test
    document.body.innerHTML = '';
  });

  it('devrait afficher le bouton pour ouvrir la boîte de dialogue', () => {
    customRender(<KeyboardShortcutsDialog shortcuts={mockShortcuts} />);
    expect(screen.getByRole('button', { name: /afficher les raccourcis clavier/i })).toBeInTheDocument();
  });

  it('devrait afficher tous les raccourcis lorsque la boîte de dialogue est ouverte', async () => {
    const user = userEvent.setup({ delay: null });
    customRender(<KeyboardShortcutsDialog shortcuts={mockShortcuts} />);

    // Ouvrir la boîte de dialogue
    const button = screen.getByRole('button', { name: /afficher les raccourcis clavier/i });
    await user.click(button);

    // Attendre que le dialogue soit affiché
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Vérifier le titre et la description
    expect(screen.getByText('Raccourcis clavier')).toBeInTheDocument();
    expect(screen.getByText('Liste des raccourcis clavier disponibles pour naviguer dans le mode cuisine.')).toBeInTheDocument();

    // Vérifier les sections
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Minuteur')).toBeInTheDocument();
    expect(screen.getByText('Affichage')).toBeInTheDocument();

    // Vérifier quelques raccourcis spécifiques
    expect(screen.getByText('Étape suivante')).toBeInTheDocument();
    expect(screen.getByText('→, N')).toBeInTheDocument();
    expect(screen.getByText('Démarrer/Pause')).toBeInTheDocument();
    expect(screen.getByText('Espace')).toBeInTheDocument();
    expect(screen.getByText('Plein écran')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('ne devrait pas afficher les raccourcis désactivés', async () => {
    const user = userEvent.setup({ delay: null });
    const shortcutsWithDisabled = {
      ...mockShortcuts,
      timer: [
        { key: 'Espace', description: 'Démarrer/Pause', enabled: false },
        { key: 'R', description: 'Réinitialiser', enabled: true },
      ],
    };

    customRender(<KeyboardShortcutsDialog shortcuts={shortcutsWithDisabled} />);
    
    // Ouvrir la boîte de dialogue
    const button = screen.getByRole('button', { name: /afficher les raccourcis clavier/i });
    await user.click(button);

    // Attendre que le dialogue soit affiché
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    }, { timeout: 1000 });

    expect(screen.queryByText('Démarrer/Pause')).not.toBeInTheDocument();
    expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
  });
}); 