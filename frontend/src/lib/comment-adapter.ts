import { Comment as RecipeComment } from '@/types/recipe';

export interface UIComment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  date: string;
  likes: number;
  isLiked?: boolean;
  replies?: UIComment[];
}

export const convertToUIComment = (comment: RecipeComment): UIComment => {
  return {
    id: comment.id,
    author: {
      name: comment.user.name,
      avatar: comment.user.avatar || '/images/default-avatar.png'
    },
    content: comment.content,
    date: new Date(comment.createdAt).toLocaleDateString('fr-FR'),
    likes: 0,
    isLiked: false
  };
}; 