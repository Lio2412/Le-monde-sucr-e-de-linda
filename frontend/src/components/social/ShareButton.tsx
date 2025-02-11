'use client';

import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      navigator.clipboard.writeText(url);
      // TODO: Ajouter une notification de succès
    }
  };

  return (
    <Button
      variant="outline"
      size="default"
      onClick={handleShare}
      className="flex items-center gap-2"
    >
      <Share2 className="w-5 h-5" />
      <span>Partager</span>
    </Button>
  );
} 