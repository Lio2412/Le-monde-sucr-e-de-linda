'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, X, Star } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ShareRecipeCompletionProps {
  recipeTitle: string;
  recipeId: string;
  onClose: () => void;
  onShare: (data: ShareData) => Promise<void>;
}

interface ShareData {
  image: File | null;
  comment: string;
  rating: number;
  recipeId: string;
}

export function ShareRecipeCompletion({
  recipeTitle,
  recipeId,
  onClose,
  onShare
}: ShareRecipeCompletionProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type et la taille
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Veuillez utiliser une image au format JPG, PNG ou WebP",
        variant: "destructive"
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "Image trop volumineuse",
        description: "La taille maximale est de 5MB",
        variant: "destructive"
      });
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onShare({
        image,
        comment,
        rating,
        recipeId
      });
      
      toast({
        title: "Partage réussi !",
        description: "Votre réalisation a été partagée avec succès."
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du partage",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="fixed inset-4 md:inset-auto md:fixed md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:h-auto bg-background p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Partager ma réalisation</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Partagez votre version de "{recipeTitle}" avec la communauté !
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Photo de votre réalisation
            </label>
            {imagePreview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <OptimizedImage
                  src={imagePreview}
                  alt="Prévisualisation"
                  className="object-cover"
                  width={600}
                  height={400}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => {
                    setImage(null);
                    setImagePreview('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="block">
                <div className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 block text-sm text-muted-foreground">
                      Cliquez pour ajouter une photo
                    </span>
                  </div>
                </div>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Note
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={rating >= value ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setRating(value)}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      rating >= value ? "fill-current" : "fill-none"
                    )}
                  />
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Commentaire
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="resize-none"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Partage en cours...' : 'Partager'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 