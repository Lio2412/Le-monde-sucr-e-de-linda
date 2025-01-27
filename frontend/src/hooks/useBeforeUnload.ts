import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UseBeforeUnloadOptions {
  shouldPreventUnload: boolean;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * Hook personnalisé pour gérer la confirmation avant de quitter la page
 * @param options - Options de configuration
 * @param options.shouldPreventUnload - Booléen qui détermine si on doit empêcher la fermeture
 * @param options.message - Message de confirmation optionnel (par défaut en français)
 * @param options.onConfirm - Callback appelé quand l'utilisateur confirme vouloir quitter
 * @param options.onCancel - Callback appelé quand l'utilisateur annule
 */
export const useBeforeUnload = ({
  shouldPreventUnload,
  message = "Êtes-vous sûr de vouloir quitter le mode cuisine ? Votre progression ne sera pas sauvegardée.",
  onConfirm,
  onCancel,
}: UseBeforeUnloadOptions) => {
  const router = useRouter();

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (shouldPreventUnload) {
      event.preventDefault();
      event.returnValue = message;
      return message;
    }
  }, [shouldPreventUnload, message]);

  const handlePopState = useCallback((event: PopStateEvent) => {
    if (shouldPreventUnload) {
      event.preventDefault();
      const confirmed = window.confirm(message);
      if (confirmed) {
        onConfirm?.();
      } else {
        onCancel?.();
        // Restaurer l'URL précédente
        window.history.pushState(null, '', window.location.href);
      }
    }
  }, [shouldPreventUnload, message, onConfirm, onCancel]);

  useEffect(() => {
    if (shouldPreventUnload) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);

      // Ajouter une entrée dans l'historique pour intercepter le retour arrière
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldPreventUnload, handleBeforeUnload, handlePopState]);

  const confirmNavigation = useCallback((href: string) => {
    if (shouldPreventUnload) {
      const confirmed = window.confirm(message);
      if (confirmed) {
        onConfirm?.();
        router.push(href);
      } else {
        onCancel?.();
      }
    } else {
      router.push(href);
    }
  }, [shouldPreventUnload, message, onConfirm, onCancel, router]);

  return {
    confirmNavigation,
  };
}; 