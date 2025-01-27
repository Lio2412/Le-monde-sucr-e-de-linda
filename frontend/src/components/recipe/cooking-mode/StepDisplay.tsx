'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Thermometer, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface StepDisplayProps {
  description: string;
  currentIndex: number;
  totalSteps: number;
  isCompleted: boolean;
  onToggleComplete: () => void;
  duration?: number;
  temperature?: number;
  direction?: number;
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
  direction = 0
}: StepDisplayProps) {
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete()}
            className={cn(
              "h-6 w-6 transition-colors",
              isCompleted && "bg-primary border-primary text-primary-foreground"
            )}
          />
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground font-medium">
              Étape {currentIndex + 1} sur {totalSteps}
            </span>
            <motion.div
              initial={false}
              animate={{ scale: isCompleted ? 1.02 : 1 }}
              className={cn(
                "text-xl font-semibold mt-1 transition-colors",
                isCompleted && "text-primary"
              )}
            >
              {description}
            </motion.div>
          </div>
        </div>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-primary"
          >
            <CheckCircle2 className="h-6 w-6" />
          </motion.div>
        )}
      </div>

      {(duration || temperature) && (
        <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
          {duration && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>{duration} min</span>
            </div>
          )}
          {temperature && (
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              <span>{temperature}°C</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
} 