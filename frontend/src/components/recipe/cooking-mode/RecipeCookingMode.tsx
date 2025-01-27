'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { PreparationMode } from './PreparationMode';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

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
  const [showPreparation, setShowPreparation] = useState(true);
  const [showIngredients, setShowIngredients] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen, isEnabled } = useFullscreen(containerRef);
  const { completedSteps, isStepCompleted, toggleStep, progress } = useStepCompletion({
    totalSteps: recipe.steps.length,
  });
  const {
    notes,
    updateNote,
    toggleNotesVisibility,
    showNotes,
    hasNotes,
    getNote,
    hasNoteForStep,
  } = useStepNotes({
    totalSteps: recipe.steps.length,
  });

  // Mettre à jour hasUnsavedChanges quand il y a des changements
  useEffect(() => {
    const hasNotes = Object.values(notes).some(note => note.trim() !== '');
    const hasCompletedSteps = completedSteps && completedSteps.size > 0;
    setHasUnsavedChanges(hasNotes || hasCompletedSteps);
  }, [notes, completedSteps]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitConfirmation(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Utilisation du hook useBeforeUnload avec les callbacks
  useBeforeUnload({
    shouldPreventUnload: hasUnsavedChanges,
    onConfirm: () => {
      onClose();
    },
    onCancel: () => {
      // Ne rien faire, l'utilisateur reste sur la page
    }
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
    <>
      <div ref={containerRef} className="fixed inset-0 bg-white z-50 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="hover:bg-gray-100"
                aria-label="Fermer le mode cuisine"
              >
                <X className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">{recipe.title}</h1>
            </div>
            <div className="flex items-center gap-4">
              {!showPreparation && (
                <>
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
                </>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto h-[calc(100vh-4rem)] py-8 px-4">
          <AnimatePresence initial={false} mode="wait">
            {showPreparation ? (
              <motion.div
                key="preparation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <PreparationMode recipe={recipe}>
                  <button
                    data-testid="start-recipe"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
                    onClick={() => setShowPreparation(false)}
                  >
                    Commencer la recette
                  </button>
                </PreparationMode>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
                {/* Étape courante */}
                <Card className={`${showIngredients ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col p-6 overflow-hidden`}>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Checkbox
                        data-testid="step-checkbox"
                        id={`step-${currentStepIndex}`}
                        checked={isStepCompleted(currentStepIndex)}
                        onCheckedChange={() => toggleStep(currentStepIndex)}
                        aria-label="Marquer comme terminée"
                      />
                      <div data-testid="step-counter" className="text-sm text-gray-500">
                        Étape {currentStepIndex + 1} sur {recipe.steps.length}
                      </div>
                    </div>
                    <div data-testid="step-description" className="mt-4">
                      {recipe.steps[currentStepIndex].description}
                    </div>
                    {currentStep.duration && currentStep.duration > 0 && (
                      <div className="mt-4">
                        <StepTimer 
                          duration={currentStep.duration || 0} 
                          onComplete={() => {
                            toast({
                              title: "Minuteur terminé !",
                              description: "L'étape est terminée.",
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showExitConfirmation}
        onClose={() => setShowExitConfirmation(false)}
        onConfirm={onClose}
        title="Quitter le mode cuisine"
        description="Êtes-vous sûr de vouloir quitter le mode cuisine ? Votre progression ne sera pas sauvegardée."
        confirmLabel="Quitter"
        cancelLabel="Rester"
      />
    </>
  );
}; 