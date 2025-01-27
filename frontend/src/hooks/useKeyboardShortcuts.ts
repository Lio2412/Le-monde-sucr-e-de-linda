import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onNextStep: () => void;
  onPreviousStep: () => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onToggleTimer?: () => void;
  onResetTimer?: () => void;
  onToggleIngredients?: () => void;
  onMarkStepCompleted?: () => void;
  isTimerEnabled?: boolean;
}

export function useKeyboardShortcuts({
  onNextStep,
  onPreviousStep,
  onClose,
  onToggleFullscreen,
  onToggleTimer,
  onResetTimer,
  onToggleIngredients,
  onMarkStepCompleted,
  isTimerEnabled = false,
}: KeyboardShortcutsProps) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Ignorer les raccourcis si l'utilisateur est en train de taper dans un champ
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        // Navigation
        case 'arrowright':
        case 'n':
          onNextStep();
          break;
        case 'arrowleft':
        case 'p':
          onPreviousStep();
          break;
        case 'escape':
          onClose();
          break;

        // Timer
        case ' ': // Espace
          if (isTimerEnabled && onToggleTimer) {
            event.preventDefault(); // Empêcher le défilement de la page
            onToggleTimer();
          }
          break;
        case 'r':
          if (isTimerEnabled && onResetTimer) {
            onResetTimer();
          }
          break;

        // Affichage
        case 'f':
          onToggleFullscreen();
          break;
        case 'i':
          if (onToggleIngredients) {
            onToggleIngredients();
          }
          break;
        case 'm':
          if (onMarkStepCompleted) {
            onMarkStepCompleted();
          }
          break;
      }
    },
    [
      onNextStep,
      onPreviousStep,
      onClose,
      onToggleFullscreen,
      onToggleTimer,
      onResetTimer,
      onToggleIngredients,
      onMarkStepCompleted,
      isTimerEnabled,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Retourner un objet avec les raccourcis disponibles pour l'affichage dans l'interface
  return {
    shortcuts: {
      navigation: [
        { key: '→, N', description: 'Étape suivante' },
        { key: '←, P', description: 'Étape précédente' },
        { key: 'Esc', description: 'Quitter' },
      ],
      timer: [
        { key: 'Espace', description: 'Démarrer/Pause', enabled: isTimerEnabled },
        { key: 'R', description: 'Réinitialiser', enabled: isTimerEnabled },
      ],
      display: [
        { key: 'F', description: 'Plein écran' },
        { key: 'I', description: 'Afficher/Masquer les ingrédients' },
        { key: 'M', description: 'Marquer comme terminé' },
      ],
    },
  };
} 