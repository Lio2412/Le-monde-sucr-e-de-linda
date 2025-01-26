import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLike } from '@/hooks/useLike';

interface LikeButtonProps {
  commentId: string;
  initialLikes?: number;
  isLiked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LikeButton({
  commentId,
  initialLikes = 0,
  isLiked = false,
  size = 'md',
  className
}: LikeButtonProps) {
  const { likes, liked, isLoading, toggleLike } = useLike({
    commentId,
    initialLikes,
    isLiked
  });

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <motion.button
      onClick={toggleLike}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{
          scale: liked ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn(
            sizes[size],
            'transition-colors',
            liked && 'fill-pink-500 text-pink-500'
          )}
        />
      </motion.div>
      <span className="text-sm">{likes}</span>
    </motion.button>
  );
} 