'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface RatingSectionProps {
  recipeId: number;
  initialRating?: number;
  totalRatings?: number;
}

export default function RatingSection({ 
  recipeId, 
  initialRating = 0,
  totalRatings = 0 
}: RatingSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [averageRating, setAverageRating] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(totalRatings);

  const handleRate = (value: number) => {
    if (hasRated) return;
    
    setRating(value);
    setHasRated(true);
    
    // Calculer la nouvelle moyenne
    const newTotal = averageRating * ratingCount + value;
    const newCount = ratingCount + 1;
    const newAverage = newTotal / newCount;
    
    setAverageRating(newAverage);
    setRatingCount(newCount);
    
    // TODO: Envoyer la note au backend
  };

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {!hasRated ? (
        <>
          <p className="text-gray-600 mb-2">Notez cette recette</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRate(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    value <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-green-600 mb-2">Merci pour votre note !</p>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`w-6 h-6 ${
                    value <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({rating} sur 5)
            </span>
          </div>
        </motion.div>
      )}

      {/* Affichage de la note moyenne */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          Note moyenne : {averageRating.toFixed(1)} sur 5
        </p>
        <p className="text-xs text-gray-400">
          {ratingCount} {ratingCount > 1 ? 'évaluations' : 'évaluation'}
        </p>
      </div>
    </div>
  );
} 