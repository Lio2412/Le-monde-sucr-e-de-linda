import { useEffect, useMemo } from 'react';

interface UseKeyboardShortcutsProps {
  onNextStep: () => void;
  onPreviousStep: () => void;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onToggleTimer?: () => void;
  onResetTimer?: () => void;
  onToggleIngredients: () => void;
  onToggleStep?: () => void;
  onToggleNotes?: () => void;
  isTimerEnabled: boolean;
}

export function useKeyboardShortcuts({
  onNextStep,
  onPreviousStep,
  onClose,
  onToggleFullscreen,
  onToggleTimer,
  onResetTimer,
  onToggleIngredients,
  onToggleStep,
  onToggleNotes,
  isTimerEnabled,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignorer les raccourcis si l'utilisateur est en train de taper dans un champ
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
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
        case 'f':
          onToggleFullscreen();
          break;
        case ' ':
          if (isTimerEnabled && onToggleTimer) {
            event.preventDefault();
            onToggleTimer();
          }
          break;
        case 'r':
          if (isTimerEnabled && onResetTimer) {
            onResetTimer();
          }
          break;
        case 'i':
          onToggleIngredients();
          break;
        case 'm':
          if (onToggleStep) {
            onToggleStep();
          }
          break;
        case 't':
          if (onToggleNotes) {
            onToggleNotes();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    onNextStep,
    onPreviousStep,
    onClose,
    onToggleFullscreen,
    onToggleTimer,
    onResetTimer,
    onToggleIngredients,
    onToggleStep,
    onToggleNotes,
    isTimerEnabled,
  ]);

  const shortcuts = useMemo(() => [
    { key: '→ ou N', description: 'Étape suivante' },
    { key: '← ou P', description: 'Étape précédente' },
    { key: 'F', description: 'Mode plein écran' },
    { key: 'I', description: 'Afficher/masquer les ingrédients' },
    { key: 'M', description: 'Marquer/démarquer l\'étape' },
    { key: 'T', description: 'Afficher/masquer les notes' },
    ...(isTimerEnabled ? [
      { key: 'Espace', description: 'Démarrer/arrêter le minuteur' },
      { key: 'R', description: 'Réinitialiser le minuteur' },
    ] : []),
    { key: 'Échap', description: 'Quitter le mode cuisine' },
  ], [isTimerEnabled]);

  return { shortcuts };
} 