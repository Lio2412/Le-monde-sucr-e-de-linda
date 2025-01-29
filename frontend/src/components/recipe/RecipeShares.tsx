'use client';

import React, { useEffect, useState } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Star, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Share {
  id: string;
  comment: string;
  rating: number;
  imagePath: string | null;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  } | null;
}

interface RecipeSharesProps {
  recipeId: string;
}

export function RecipeShares({ recipeId }: RecipeSharesProps) {
  const [shares, setShares] = useState<Share[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShares = async () => {
      try {
        const response = await fetch(`/api/recipes/share?recipeId=${recipeId}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des partages');
        }
        const data = await response.json();
        setShares(data);
      } catch (err) {
        setError('Impossible de charger les partages');
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShares();
  }, [recipeId]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (shares.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun partage pour cette recette pour le moment.
        Soyez le premier à partager votre réalisation !
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold mb-4">
        Réalisations de la communauté
      </h3>
      
      <div className="grid gap-6 md:grid-cols-2">
        {shares.map((share) => (
          <article
            key={share.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {share.imagePath && (
              <div className="relative aspect-[4/3]">
                <OptimizedImage
                  src={share.imagePath}
                  alt="Réalisation de la recette"
                  className="object-cover"
                  width={600}
                  height={450}
                />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {share.user?.image ? (
                    <OptimizedImage
                      src={share.user.image}
                      alt={share.user.name || 'Utilisateur'}
                      width={40}
                      height={40}
                      className="rounded-full w-10 h-10"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <span className="font-medium">
                    {share.user?.name || 'Utilisateur anonyme'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < share.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-600 mb-2">{share.comment}</p>
              
              <div className="text-sm text-gray-400">
                {formatDistanceToNow(new Date(share.createdAt), {
                  addSuffix: true,
                  locale: fr
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
} 