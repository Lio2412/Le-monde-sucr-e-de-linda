'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface LikeButtonProps {
  recipeId: string;
  initialLikes?: number;
  isLiked?: boolean;
  className?: string;
}

export default function LikeButton({
  recipeId,
  initialLikes = 0,
  isLiked = false,
  className = ''
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(isLiked);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = async () => {
    if (isAnimating) return;

    try {
      setIsAnimating(true);
      // TODO: Intégrer l'API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulation d'appel API

      setLiked(!liked);
      setLikes(prev => liked ? prev - 1 : prev + 1);
      
      if (!liked) {
        toast.success('Recette ajoutée à vos favoris !');
      }
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`relative inline-flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      disabled={isAnimating}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={liked ? 'liked' : 'unliked'}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            className={`w-5 h-5 ${
              liked
                ? 'fill-pink-500 text-pink-500'
                : 'text-gray-400 hover:text-pink-500'
            } transition-colors`}
          />
        </motion.div>
      </AnimatePresence>

      <span className="text-sm text-gray-500">{likes}</span>

      {isAnimating && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-ping" />
        </motion.div>
      )}
    </button>
  );
} 