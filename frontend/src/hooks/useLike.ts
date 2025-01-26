import { useState } from 'react';
import { toast } from 'sonner';

interface UseLikeProps {
  commentId: string;
  initialLikes?: number;
  isLiked?: boolean;
}

export function useLike({ commentId, initialLikes = 0, isLiked = false }: UseLikeProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(isLiked);
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du like');
      }

      const data = await response.json();
      setLikes(data.likes);
      setLiked(!liked);
      toast.success(liked ? 'Like retiré' : 'Commentaire liké !');
    } catch (error) {
      toast.error('Une erreur est survenue');
      console.error('Like error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likes,
    liked,
    isLoading,
    toggleLike,
  };
} 