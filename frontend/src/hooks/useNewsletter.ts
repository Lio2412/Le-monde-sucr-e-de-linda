import { useState } from 'react';
import { toast } from 'sonner';

interface UseNewsletterProps {
  onSuccess?: () => void;
}

export function useNewsletter({ onSuccess }: UseNewsletterProps = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = async (email: string) => {
    setIsLoading(true);
    try {
      // TODO: Remplacer par l'appel API réel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Inscription réussie ! Bienvenue dans notre newsletter.');
      onSuccess?.();
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (email: string) => {
    setIsLoading(true);
    try {
      // TODO: Remplacer par l'appel API réel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Désinscription effectuée avec succès.');
      onSuccess?.();
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    subscribe,
    unsubscribe
  };
} 