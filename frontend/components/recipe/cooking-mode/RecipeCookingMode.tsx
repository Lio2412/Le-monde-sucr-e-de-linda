'use client';

import React, { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { StepTimer } from './StepTimer';
import { useToast } from '@/components/ui/use-toast';

interface RecipeCookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipeCookingMode: React.FC<RecipeCookingModeProps> = ({
  recipe,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const currentStep = recipe.steps[currentStepIndex];
  const { toast } = useToast();

  const goToNextStep = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleTimerComplete = () => {
    toast({
      title: "Minuteur terminé !",
      description: "L'étape est terminée, vous pouvez passer à la suivante.",
      duration: 5000,
    });
  };

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'n':
          goToNextStep();
          break;
        case 'ArrowLeft':
        case 'p':
          goToPreviousStep();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStepIndex, recipe.steps.length]);

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

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="container mx-auto h-full py-8 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{recipe.title}</h1>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Utilisez les flèches ← → ou les touches P N pour naviguer
            </div>
            <Button variant="ghost" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Ingredients panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Ingrédients</h2>
              <ScrollArea className="h-[calc(100vh-500px)]">
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`ingredient-${index}`}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`ingredient-${index}`}>
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </Card>

            {currentStep.duration && (
              <StepTimer
                duration={currentStep.duration}
                onComplete={handleTimerComplete}
              />
            )}
          </div>

          {/* Current step */}
          <Card className="p-6 lg:col-span-2 flex flex-col overflow-hidden">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Étape {currentStepIndex + 1} sur {recipe.steps.length}
                </div>
                {currentStep.duration && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Bell className="w-4 h-4" />
                    {currentStep.duration} minutes
                  </div>
                )}
              </div>
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentStepIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="w-full"
                >
                  <p className="text-lg">{currentStep.description}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Étape précédente
              </Button>
              <Button
                onClick={goToNextStep}
                disabled={currentStepIndex === recipe.steps.length - 1}
                className="flex items-center gap-2"
              >
                Étape suivante
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 