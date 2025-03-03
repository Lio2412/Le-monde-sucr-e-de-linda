'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Thermometer, Timer, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
  progress?: number;
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
  progress: externalProgress,
}: StepDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const progress = externalProgress !== undefined 
    ? externalProgress 
    : ((currentIndex + 1) / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Barre de progression améliorée */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Progression de la recette</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-2" />
          <div className="absolute top-3 left-0 right-0 flex justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 ${
                  index < currentIndex
                    ? 'bg-primary border-primary'
                    : index === currentIndex
                    ? 'bg-primary/50 border-primary animate-pulse'
                    : 'bg-background border-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <Card className="p-6 relative">
        {/* Indicateurs de temps et température */}
        <div className="absolute -top-3 right-4 flex gap-3">
          {duration && (
            <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{duration} min</span>
            </div>
          )}
          {temperature && (
            <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full flex items-center gap-2 text-sm">
              <Thermometer className="w-4 h-4" />
              <span>{temperature}°C</span>
            </div>
          )}
        </div>

        {/* Description de l'étape */}
        <div className="space-y-4">
          <p className="text-lg">
            {description}
          </p>
          
          {/* Case à cocher avec animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-2"
          >
            <Checkbox
              id={`step-${currentIndex}`}
              checked={isCompleted}
              onCheckedChange={onToggleComplete}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <label
              htmlFor={`step-${currentIndex}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Marquer comme terminée
            </label>
          </motion.div>
        </div>

        {/* Indicateur de progression */}
        <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
          Étape {currentIndex + 1} sur {totalSteps}
        </div>
      </Card>
    </div>
  );
} 