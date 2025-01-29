'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Thermometer, Timer, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface StepDisplayProps {
  description: string;
  currentIndex: number;
  totalSteps: number;
  isCompleted: boolean;
  onToggleComplete: () => void;
  duration?: number;
  temperature?: number;
  direction?: number;
  imageUrl?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export function StepDisplay({
  description,
  currentIndex,
  totalSteps,
  isCompleted,
  onToggleComplete,
  duration,
  temperature,
  direction = 0,
  imageUrl,
}: StepDisplayProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }}
      className={cn(
        "rounded-lg p-6 transition-all",
        isCompleted ? "bg-primary/5 border-primary/20" : "bg-muted border-transparent",
        "border-2"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Étape {currentIndex + 1} sur {totalSteps}
        </div>
        <div className="flex items-center gap-4">
          {temperature && (
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="h-4 w-4" aria-hidden="true" />
              <span>{temperature}°C</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{duration} min</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id="complete-step"
              checked={isCompleted}
              onCheckedChange={onToggleComplete}
              data-testid="complete-step-button"
              aria-label="Marquer comme terminé"
            />
            <label
              htmlFor="complete-step"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Marquer comme terminé
            </label>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {imageUrl && !imageError && (
          <div className="relative w-full h-48 mb-4">
            <Image
              src={imageUrl}
              alt="Illustration de l'étape"
              fill
              className="object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          </div>
        )}
        {imageError && (
          <div className="relative w-full h-48 mb-4 bg-muted rounded-lg flex items-center justify-center">
            <Image
              src="/images/recipe-placeholder.jpg"
              alt="Image invalide"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}
        <p className="text-lg" data-testid="step-description">{description}</p>
      </div>
    </motion.div>
  );
} 