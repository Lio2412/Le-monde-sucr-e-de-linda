'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Share2, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';

interface ShareRecipeCompletionProps {
  recipeTitle: string;
  onClose: () => void;
  onShare: (data: ShareData) => Promise<void>;
}

interface ShareData {
  image: File | null;
  comment: string;
}

export function ShareRecipeCompletion({
  recipeTitle,
  onClose,
  onShare,
}: ShareRecipeCompletionProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast({
          title: "Image trop volumineuse",
          description: "L'image ne doit pas dépasser 5MB",
          variant: "destructive",
        });
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      await onShare({ image, comment });
      toast({
        title: "Partage réussi !",
        description: "Votre réalisation a été partagée avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur lors du partage",
        description: "Une erreur est survenue lors du partage de votre réalisation.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold">Partager votre réalisation</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-muted-foreground">
          Partagez votre version de "{recipeTitle}" avec la communauté !
        </p>

        {/* Zone de dépôt d'image */}
        <div className="space-y-4">
          <label
            htmlFor="recipe-image"
            className={`
              block w-full aspect-video rounded-lg border-2 border-dashed
              ${imagePreview ? 'border-primary' : 'border-muted-foreground'}
              relative cursor-pointer hover:border-primary transition-colors
              flex items-center justify-center
            `}
          >
            <AnimatePresence mode="wait">
              {imagePreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={imagePreview}
                    alt="Aperçu"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.preventDefault();
                      removeImage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center p-12"
                >
                  <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Cliquez ou déposez une photo de votre réalisation
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    PNG, JPG ou GIF jusqu'à 5MB
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <Input
              id="recipe-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        {/* Commentaire */}
        <div className="space-y-2">
          <label
            htmlFor="comment"
            className="text-sm font-medium text-muted-foreground"
          >
            Commentaire (optionnel)
          </label>
          <Textarea
            id="comment"
            placeholder="Partagez vos impressions, modifications ou conseils..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            onClick={handleShare}
            disabled={!image || isSharing}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            {isSharing ? 'Partage en cours...' : 'Partager'}
          </Button>
        </div>
      </div>
    </Card>
  );
} 