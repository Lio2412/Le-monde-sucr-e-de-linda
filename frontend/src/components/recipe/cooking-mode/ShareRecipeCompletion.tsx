'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Share2, Upload, X, Heart, Star, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  onShare,
}: ShareRecipeCompletionProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { width, height } = useWindowSize();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

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
      await onShare({ image, comment, rating, recipeId });
      toast({
        title: "Partage réussi !",
        description: "Votre réalisation a été partagée avec succès.",
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors du partage:', error);
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
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <Card className="w-full max-w-2xl mx-auto bg-white shadow-xl relative">
          <ScrollArea className="max-h-[90vh]">
            <motion.div 
              className="p-6 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center sticky top-0 bg-white z-10">
                <motion.h3 
                  className="text-2xl font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Partagez votre réalisation
                </motion.h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 hover:bg-pink-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Partagez votre version de <span className="font-medium text-pink-500">"{recipeTitle}"</span> avec la communauté !
              </motion.p>

              {/* Zone de dépôt d'image avec animation améliorée */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label
                  htmlFor="recipe-image"
                  className={cn(
                    "block w-full aspect-video rounded-lg border-2 border-dashed relative cursor-pointer transition-all duration-300",
                    "hover:border-pink-400 hover:bg-pink-50/50",
                    imagePreview ? "border-primary" : "border-muted-foreground"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {imagePreview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full h-full group"
                      >
                        <Image
                          src={imagePreview}
                          alt="Aperçu"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <p className="text-white text-sm">Cliquez pour changer l'image</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
              </motion.div>

              {/* Notation */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="text-sm font-medium text-muted-foreground">
                  Notez votre expérience
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "w-6 h-6 transition-colors",
                          (hoverRating || rating) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Commentaire avec animation */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
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
                  className="min-h-[100px] focus:border-pink-400 focus:ring-pink-400"
                />
              </motion.div>

              {/* Actions avec animation */}
              <motion.div 
                className="flex justify-end gap-4 sticky bottom-0 bg-white pt-4 border-t mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="hover:bg-pink-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={!image || isSharing}
                  className="gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  {isSharing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Upload className="h-4 w-4" />
                      </motion.div>
                      Partage en cours...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Partager
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Badge de récompense */}
              {image && (
                <motion.div
                  className="absolute top-4 right-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </ScrollArea>
        </Card>
      </div>
    </>
  );
} 