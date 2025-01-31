import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Share } from '@/types/share';
import { OptimizedImage } from '../common/OptimizedImage';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { useSession } from 'next-auth/react';

interface ShareCardProps {
  share: Share;
}

export function ShareCard({ share }: ShareCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!session?.user) return;
      
      try {
        const response = await fetch(`/api/likes/${share.id}/hasLiked`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.hasLiked);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du like:', error);
      }
    };

    const fetchLikeCount = async () => {
      try {
        const response = await fetch(`/api/likes/${share.id}/count`);
        if (response.ok) {
          const data = await response.json();
          setLikeCount(data.count);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre de likes:', error);
      }
    };

    fetchLikeStatus();
    fetchLikeCount();
  }, [share.id, session?.user]);

  const handleLike = async () => {
    if (!session?.user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour liker un partage",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/likes/${share.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
      toast({
        title: "Erreur",
        description: "Impossible de liker ce partage",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
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
        <p className="text-gray-600">{share.comment}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Partagé par {share.user?.name || 'Anonyme'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
} 