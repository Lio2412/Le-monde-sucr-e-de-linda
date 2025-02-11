import { useState } from 'react';
import { toast } from 'sonner';

interface UseRatingProps {
  recipeId: string;
  initialRating?: number;
}

export function useRating({ recipeId, initialRating = 0 }: UseRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [isLoading, setIsLoading] = useState(false);

  const submitRating = async (newRating: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: newRating }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la notation');
      }

      const data = await response.json();
      setRating(data.rating);
      toast.success('Merci pour votre note !');
    } catch (error) {
      toast.error('Une erreur est survenue lors de la notation');
      console.error('Rating error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rating,
    isLoading,
    submitRating,
  };
} 