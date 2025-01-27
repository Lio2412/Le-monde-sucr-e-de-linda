'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bell, Timer, Clock, X, Maximize2, Minimize2, StickyNote } from 'lucide-react';
import { StepTimer } from '@/components/recipe/cooking-mode/StepTimer';
import { useToast } from '@/components/ui/use-toast';
import { IngredientsList } from '@/components/recipe/cooking-mode/IngredientsList';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsDialog } from '@/components/recipe/cooking-mode/KeyboardShortcutsDialog';
import { useStepCompletion } from '@/hooks/useStepCompletion';
import { Checkbox } from '@/components/ui/checkbox';
import { useStepNotes } from '@/hooks/useStepNotes';
import { StepNotes } from '@/components/recipe/cooking-mode/StepNotes';

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
  const [showIngredients, setShowIngredients] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen, isEnabled } = useFullscreen(containerRef);
  const { isStepCompleted, toggleStep, progress } = useStepCompletion({
    totalSteps: recipe.steps.length,
  });
  const {
    notes,
    showNotes,
    updateNote,
    getNote,
    toggleNotesVisibility,
    hasNotes,
    hasNoteForStep,
  } = useStepNotes({
    totalSteps: recipe.steps.length,
  });

  // Vérification de sécurité pour s'assurer que recipe.steps existe
  if (!recipe?.steps?.length) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="p-6">
          <p className="text-lg">Aucune étape n'a été trouvée pour cette recette.</p>
          <Button className="mt-4" onClick={onClose}>Fermer</Button>
        </Card>
      </div>
    );
  }

  const currentStep = recipe.steps[currentStepIndex];
  const stepDuration = currentStep?.duration || 0;

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, recipe.steps.length]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false);
    toast({
      title: "Minuteur terminé !",
      description: "L'étape est terminée, vous pouvez passer à la suivante.",
      duration: 5000,
    });
  }, [toast]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const toggleIngredientsVisibility = useCallback(() => {
    setShowIngredients(prev => !prev);
  }, []);

  // Utilisation du hook des raccourcis clavier
  const { shortcuts } = useKeyboardShortcuts({
    onNextStep: goToNextStep,
    onPreviousStep: goToPreviousStep,
    onClose,
    onToggleFullscreen: toggleFullscreen,
    onToggleTimer: stepDuration > 0 ? toggleTimer : undefined,
    onResetTimer: stepDuration > 0 ? resetTimer : undefined,
    onToggleIngredients: toggleIngredientsVisibility,
    onToggleStep: () => toggleStep(currentStepIndex),
    onToggleNotes: toggleNotesVisibility,
    isTimerEnabled: stepDuration > 0,
  });

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
    <div ref={containerRef} className="fixed inset-0 bg-white z-50 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
              aria-label="Fermer le mode cuisine"
            >
              <X className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{recipe.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Progression : {progress}%
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNotesVisibility}
              className="hover:bg-gray-100 relative"
              aria-label="Afficher/masquer les notes"
            >
              <StickyNote className="h-5 w-5" />
              {hasNotes && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
            <KeyboardShortcutsDialog shortcuts={shortcuts} />
            {isEnabled && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="hover:bg-gray-100"
                aria-label={isFullscreen ? "Quitter le mode plein écran" : "Passer en mode plein écran"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto h-[calc(100vh-4rem)] py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Panneau latéral */}
          {showIngredients && (
            <div className="lg:col-span-1 space-y-6 overflow-auto">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Ingrédients</h2>
                <IngredientsList
                  ingredients={recipe.ingredients || []}
                  defaultServings={recipe.servings || 1}
                />
              </Card>

              {stepDuration > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Timer className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Minuteur</h2>
                  </div>
                  <StepTimer
                    duration={stepDuration}
                    onComplete={handleTimerComplete}
                    isRunning={isTimerRunning}
                    onToggle={toggleTimer}
                    onReset={resetTimer}
                  />
                </Card>
              )}

              {showNotes && (
                <StepNotes
                  stepIndex={currentStepIndex}
                  note={getNote(currentStepIndex)}
                  onUpdateNote={updateNote}
                  onClose={toggleNotesVisibility}
                />
              )}
            </div>
          )}

          {/* Étape courante */}
          <Card className={`${showIngredients ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col p-6 overflow-hidden`}>
            <div className="flex-1">
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      Étape {currentStepIndex + 1} sur {recipe.steps.length}
                    </span>
                    {stepDuration > 0 && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {stepDuration} minutes
                      </span>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`step-${currentStepIndex}`}
                          checked={isStepCompleted(currentStepIndex)}
                          onCheckedChange={() => toggleStep(currentStepIndex)}
                        />
                        <label
                          htmlFor={`step-${currentStepIndex}`}
                          className="text-sm text-muted-foreground"
                        >
                          Marquer comme terminée (M)
                        </label>
                      </div>
                      {hasNoteForStep(currentStepIndex) && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <StickyNote className="w-4 h-4" />
                          Note ajoutée
                        </span>
                      )}
                    </div>
                  </div>
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
                    className="flex-1"
                  >
                    <div className="prose prose-lg max-w-none">
                      <p className={`text-xl leading-relaxed ${isStepCompleted(currentStepIndex) ? 'text-muted-foreground line-through' : ''}`}>
                        {currentStep?.description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
                className="w-[140px] h-12"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Précédent
              </Button>
              <Button
                variant="outline"
                onClick={goToNextStep}
                disabled={currentStepIndex === recipe.steps.length - 1}
                className="w-[140px] h-12"
              >
                Suivant
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 