import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { fireEvent } from '@testing-library/dom';

describe('useKeyboardShortcuts', () => {
  const mockHandlers = {
    onNextStep: jest.fn(),
    onPreviousStep: jest.fn(),
    onClose: jest.fn(),
    onToggleFullscreen: jest.fn(),
    onToggleTimer: jest.fn(),
    onResetTimer: jest.fn(),
    onToggleIngredients: jest.fn(),
    onToggleStep: jest.fn(),
    onToggleNotes: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait appeler onNextStep avec la flèche droite ou N', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockHandlers.onNextStep).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'n' });
    expect(mockHandlers.onNextStep).toHaveBeenCalledTimes(2);
  });

  it('devrait appeler onPreviousStep avec la flèche gauche ou P', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(mockHandlers.onPreviousStep).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'p' });
    expect(mockHandlers.onPreviousStep).toHaveBeenCalledTimes(2);
  });

  it('devrait appeler onClose avec Escape', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onToggleTimer avec Espace quand le timer est activé', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    fireEvent.keyDown(window, { key: ' ' });
    expect(mockHandlers.onToggleTimer).toHaveBeenCalledTimes(1);
  });

  it('ne devrait pas appeler onToggleTimer avec Espace quand le timer est désactivé', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: false }));

    fireEvent.keyDown(window, { key: ' ' });
    expect(mockHandlers.onToggleTimer).not.toHaveBeenCalled();
  });

  it('devrait appeler onResetTimer avec R quand le timer est activé', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    fireEvent.keyDown(window, { key: 'r' });
    expect(mockHandlers.onResetTimer).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onToggleIngredients avec I', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    fireEvent.keyDown(window, { key: 'i' });
    expect(mockHandlers.onToggleIngredients).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onToggleStep avec M', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    fireEvent.keyDown(window, { key: 'm' });
    expect(mockHandlers.onToggleStep).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onToggleNotes avec T', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    fireEvent.keyDown(window, { key: 't' });
    expect(mockHandlers.onToggleNotes).toHaveBeenCalledTimes(1);
  });

  it('devrait retourner la liste des raccourcis disponibles', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    expect(result.current.shortcuts).toEqual([
      { key: '→ ou N', description: 'Étape suivante' },
      { key: '← ou P', description: 'Étape précédente' },
      { key: 'F', description: 'Mode plein écran' },
      { key: 'I', description: 'Afficher/masquer les ingrédients' },
      { key: 'M', description: 'Marquer/démarquer l\'étape' },
      { key: 'T', description: 'Afficher/masquer les notes' },
      { key: 'Espace', description: 'Démarrer/arrêter le minuteur' },
      { key: 'R', description: 'Réinitialiser le minuteur' },
      { key: 'Échap', description: 'Quitter le mode cuisine' },
    ]);
  });

  it('ne devrait pas inclure les raccourcis du timer quand il est désactivé', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: false }));

    const timerShortcuts = result.current.shortcuts.filter(
      shortcut => shortcut.description.includes('minuteur')
    );
    expect(timerShortcuts).toHaveLength(0);
  });

  it('devrait ignorer les raccourcis dans les champs de saisie', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(mockHandlers.onNextStep).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
}); 