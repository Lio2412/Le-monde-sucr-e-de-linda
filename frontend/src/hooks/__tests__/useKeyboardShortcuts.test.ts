import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  const mockHandlers = {
    onNextStep: jest.fn(),
    onPreviousStep: jest.fn(),
    onClose: jest.fn(),
    onToggleFullscreen: jest.fn(),
    onToggleTimer: jest.fn(),
    onResetTimer: jest.fn(),
    onToggleIngredients: jest.fn(),
    onMarkStepCompleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const simulateKeyPress = (key: string) => {
    const event = new KeyboardEvent('keydown', { key });
    window.dispatchEvent(event);
  };

  it('devrait appeler onNextStep avec la flèche droite ou N', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    simulateKeyPress('ArrowRight');
    expect(mockHandlers.onNextStep).toHaveBeenCalledTimes(1);

    simulateKeyPress('n');
    expect(mockHandlers.onNextStep).toHaveBeenCalledTimes(2);
  });

  it('devrait appeler onPreviousStep avec la flèche gauche ou P', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    simulateKeyPress('ArrowLeft');
    expect(mockHandlers.onPreviousStep).toHaveBeenCalledTimes(1);

    simulateKeyPress('p');
    expect(mockHandlers.onPreviousStep).toHaveBeenCalledTimes(2);
  });

  it('devrait appeler onClose avec Escape', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    simulateKeyPress('Escape');
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
  });

  it('devrait gérer les raccourcis du timer uniquement si isTimerEnabled est true', () => {
    // Timer désactivé
    const { unmount } = renderHook(() => 
      useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: false })
    );

    simulateKeyPress(' ');
    expect(mockHandlers.onToggleTimer).not.toHaveBeenCalled();

    simulateKeyPress('r');
    expect(mockHandlers.onResetTimer).not.toHaveBeenCalled();

    unmount();

    // Timer activé
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    simulateKeyPress(' ');
    expect(mockHandlers.onToggleTimer).toHaveBeenCalledTimes(1);

    simulateKeyPress('r');
    expect(mockHandlers.onResetTimer).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onToggleFullscreen avec F', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    simulateKeyPress('f');
    expect(mockHandlers.onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onToggleIngredients avec I', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    simulateKeyPress('i');
    expect(mockHandlers.onToggleIngredients).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler onMarkStepCompleted avec M', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    simulateKeyPress('m');
    expect(mockHandlers.onMarkStepCompleted).toHaveBeenCalledTimes(1);
  });

  it('devrait ignorer les raccourcis dans les champs de saisie', () => {
    renderHook(() => useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true }));

    // Simuler un événement avec un champ de saisie comme cible
    const input = document.createElement('input');
    document.body.appendChild(input);
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    Object.defineProperty(event, 'target', { value: input });
    window.dispatchEvent(event);

    expect(mockHandlers.onNextStep).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('devrait retourner la liste des raccourcis disponibles', () => {
    const { result } = renderHook(() => 
      useKeyboardShortcuts({ ...mockHandlers, isTimerEnabled: true })
    );

    expect(result.current.shortcuts).toEqual({
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
    });
  });
}); 