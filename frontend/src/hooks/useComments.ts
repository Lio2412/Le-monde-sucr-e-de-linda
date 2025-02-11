import useSWR from 'swr';
import { api, type Comment } from '@/services/api';

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  isError: any;
  addComment: (content: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
}

export function useComments(recipeId: string): UseCommentsReturn {
  const { data, error, isLoading, mutate } = useSWR<Comment[]>(
    `/recipes/${recipeId}/comments`,
    () => api.recipes.getById(recipeId).then(recipe => recipe.comments)
  );

  const addComment = async (content: string) => {
    try {
      await api.recipes.comment(recipeId, content);
      mutate(); // Recharge les commentaires
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  };

  const likeComment = async (commentId: string) => {
    try {
      await api.social.likeComment(recipeId, commentId);
      mutate(); // Recharge les commentaires
    } catch (error) {
      console.error('Erreur lors du like du commentaire:', error);
      throw error;
    }
  };

  return {
    comments: data || [],
    isLoading,
    isError: error,
    addComment,
    likeComment
  };
} 