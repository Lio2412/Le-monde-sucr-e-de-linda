import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyboardShortcutsDialog } from '../KeyboardShortcutsDialog';

const mockShortcuts = [
  { key: '→ ou N', description: 'Étape suivante' },
  { key: '← ou P', description: 'Étape précédente' },
  { key: 'F', description: 'Mode plein écran' },
  { key: 'I', description: 'Afficher/masquer les ingrédients' },
  { key: 'M', description: 'Marquer/démarquer l\'étape' },
  { key: 'Espace', description: 'Démarrer/arrêter le minuteur' },
  { key: 'R', description: 'Réinitialiser le minuteur' },
  { key: 'Échap', description: 'Quitter le mode cuisine' },
];

describe('KeyboardShortcutsDialog', () => {
  beforeEach(() => {
    // Réinitialiser le DOM avant chaque test
    document.body.innerHTML = '';
  });

  it('devrait afficher le bouton pour ouvrir la boîte de dialogue', () => {
    render(<KeyboardShortcutsDialog shortcuts={mockShortcuts} />);
    
    const button = screen.getByRole('button', { name: /afficher les raccourcis clavier/i });
    expect(button).toBeInTheDocument();
  });

  it('devrait afficher la boîte de dialogue avec le titre et la description', async () => {
    const user = userEvent.setup({ delay: null });
    render(<KeyboardShortcutsDialog shortcuts={mockShortcuts} />);
    
    const button = screen.getByRole('button', { name: /afficher les raccourcis clavier/i });
    await user.click(button);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Raccourcis clavier')).toBeInTheDocument();
    expect(screen.getByText(/liste des raccourcis clavier disponibles/i)).toBeInTheDocument();
  });

  it('devrait afficher tous les raccourcis avec leurs descriptions', async () => {
    const user = userEvent.setup({ delay: null });
    render(<KeyboardShortcutsDialog shortcuts={mockShortcuts} />);
    
    const button = screen.getByRole('button', { name: /afficher les raccourcis clavier/i });
    await user.click(button);
    
    mockShortcuts.forEach(shortcut => {
      expect(screen.getByText(shortcut.description)).toBeInTheDocument();
      expect(screen.getByText(shortcut.key)).toBeInTheDocument();
    });
  });
}); 