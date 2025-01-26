'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RatingProps {
  initialRating?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Rating({
  initialRating = 0,
  onChange,
  readOnly = false,
  size = 'md',
  className
}: RatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleClick = (value: number) => {
    if (readOnly) return;
    setRating(value);
    onChange?.(value);
  };

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const starSize = sizes[size];

  return (
    <div 
      className={cn("flex gap-1 items-center", className)}
      onMouseLeave={() => setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <motion.button
          key={value}
          type="button"
          whileHover={{ scale: readOnly ? 1 : 1.1 }}
          whileTap={{ scale: readOnly ? 1 : 0.9 }}
          className={cn(
            "transition-colors",
            readOnly ? "cursor-default" : "cursor-pointer"
          )}
          onClick={() => handleClick(value)}
          onMouseEnter={() => !readOnly && setHoverRating(value)}
        >
          <Star
            className={cn(
              starSize,
              "transition-colors",
              (hoverRating || rating) >= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        </motion.button>
      ))}
    </div>
  );
} 