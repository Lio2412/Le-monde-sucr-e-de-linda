'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bell, Timer, Clock, X, Maximize2, Minimize2, StickyNote, Edit, Plus, Minus, ChefHat, Trophy, PartyPopper } from 'lucide-react';
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
import { useRecipeHistory } from '@/hooks/useRecipeHistory';
import RecipeHistory from './RecipeHistory';
import { useDeviceType } from '@/hooks/useDeviceType';
import { StepDisplay } from './StepDisplay';
import Image from 'next/image';

interface RecipeCookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

interface CompletionModeProps {
  recipe: Recipe;
  onClose: () => void;
}

const CompletionMode: React.FC<CompletionModeProps> = ({ recipe, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center px-4"
    >
      <div className="flex items-center justify-center mb-6">
        <PartyPopper className="h-16 w-16 text-pink-500 mr-4" />
        <Trophy className="h-16 w-16 text-yellow-500" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Félicitations !</h2>
      <p className="text-xl text-muted-foreground mb-8">
        Vous avez terminé la recette "{recipe.title}" avec succès !
      </p>
      <div className="space-y-4">
        <p className="text-lg">
          N'oubliez pas de prendre une photo de votre création et de la partager !
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={onClose}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8"
          >
            Terminer
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const RecipeCookingMode: React.FC<RecipeCookingModeProps> = ({
  recipe: initialRecipe,
  onClose,
}) => {
  // Ajouter les équipements par défaut si nécessaire
  const recipe = useMemo(() => ({
    ...initialRecipe,
    servings: initialRecipe.servings || 1,
    equipment: initialRecipe.equipment || [
      'Four',
      'Batteur électrique',
      'Moule à tarte',
      'Balance de cuisine',
      'Saladier',
      'Fouet',
      'Spatule',
      'Papier cuisson'
    ]
  }), [initialRecipe]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showPreparation, setShowPreparation] = useState(true);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [servings, setServings] = useState(recipe.servings || 1);
  const [completedIngredients, setCompletedIngredients] = useState<Set<number>>(new Set());
  const [showCompletion, setShowCompletion] = useState(false);

  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen, isEnabled } = useFullscreen(containerRef);
  const { completedSteps, isStepCompleted, toggleStep, progress } = useStepCompletion({
    totalSteps: recipe.steps.length,
  });
  const {
    notes,
    updateNote,
    toggleNotesVisibility: toggleNotesPanel,
    hasNotes,
    getNote,
    hasNoteForStep,
  } = useStepNotes({
    totalSteps: recipe.steps.length,
  });
  const { addToHistory } = useRecipeHistory();
  const { isTablet } = useDeviceType();

  const toggleNotesVisibility = useCallback(() => {
    setShowNotes(prev => !prev);
    if (showIngredients) {
      setShowIngredients(false);
    }
  }, [showIngredients]);

  const toggleIngredientsVisibility = useCallback(() => {
    setShowIngredients(prev => !prev);
    if (showNotes) {
      setShowNotes(false);
    }
  }, [showNotes]);

  // Optimisation des effets
  useEffect(() => {
    const checkUnsavedChanges = () => {
      const hasNotes = Object.values(notes).some(note => note.trim() !== '');
      const hasCompletedSteps = completedSteps.size > 0;
      const hasCompletedIngredients = completedIngredients.size > 0;
      const hasChanges = hasNotes || hasCompletedSteps || hasCompletedIngredients;
      console.log('Changements détectés:', { hasNotes, hasCompletedSteps, hasCompletedIngredients, hasChanges });
      return hasChanges;
    };

    const unsavedChanges = checkUnsavedChanges();
    setHasUnsavedChanges(unsavedChanges);
  }, [notes, completedSteps, completedIngredients]);

  // Effet pour l'historique
  useEffect(() => {
    if (!recipe?.id) return;
    
    const recipeData = {
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug
    };

    const addToHistoryOnce = () => {
      addToHistory(recipeData);
    };

    addToHistoryOnce();
  }, [recipe?.id]);

  const handleClose = useCallback(() => {
    console.log('handleClose appelé, hasUnsavedChanges:', hasUnsavedChanges);
    setShowExitConfirmation(true);
  }, [hasUnsavedChanges]);

  const handleConfirmExit = useCallback(() => {
    console.log('handleConfirmExit appelé');
    setShowExitConfirmation(false);
    onClose();
  }, [onClose]);

  const handleCancelExit = useCallback(() => {
    console.log('handleCancelExit appelé');
    setShowExitConfirmation(false);
  }, []);

  // Utilisation du hook useBeforeUnload avec les callbacks
  useBeforeUnload({
    shouldPreventUnload: hasUnsavedChanges,
    onConfirm: handleConfirmExit,
    onCancel: handleCancelExit
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Êtes-vous sûr de vouloir quitter le mode cuisine ? Vos progrès ne seront pas sauvegardés.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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

  // Optimisation des valeurs calculées
  const currentStep = useMemo(() => recipe.steps[currentStepIndex], [recipe.steps, currentStepIndex]);
  const stepDuration = useMemo(() => currentStep?.duration || 0, [currentStep]);
  const isLastStep = useMemo(() => currentStepIndex === recipe.steps.length - 1, [currentStepIndex, recipe.steps.length]);
  const allStepsCompleted = useMemo(() => progress === 100, [progress]);

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
      setIsTimerRunning(false);
    }
  }, [currentStepIndex, recipe.steps.length]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
      setIsTimerRunning(false);
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

  const toggleIngredient = useCallback((index: number) => {
    setCompletedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Utilisation du hook des raccourcis clavier
  const { shortcuts } = useKeyboardShortcuts({
    onNextStep: () => {
      goToNextStep();
    },
    onPreviousStep: () => {
      goToPreviousStep();
    },
    onClose,
    onToggleFullscreen: () => {
      toggleFullscreen();
    },
    onToggleTimer: stepDuration > 0 ? toggleTimer : undefined,
    onResetTimer: stepDuration > 0 ? resetTimer : undefined,
    onToggleIngredients: toggleIngredientsVisibility,
    onToggleStep: () => {
      toggleStep(currentStepIndex);
    },
    onToggleNotes: toggleNotesVisibility,
    isTimerEnabled: stepDuration > 0,
  });

  // Optimisation de l'effet de progression automatique
  useEffect(() => {
    if (showPreparation) return;

    // Vérifier si toutes les étapes sont complétées
    const allStepsCompleted = Array.from({ length: recipe.steps.length }).every((_, index) => 
      isStepCompleted(index)
    );

    console.log('Vérification des étapes:', {
      allStepsCompleted,
      completedSteps: Array.from(completedSteps),
      totalSteps: recipe.steps.length,
      currentStepIndex
    });

    // Si toutes les étapes sont complétées ou si nous sommes à la dernière étape et qu'elle est complétée
    if ((allStepsCompleted || (currentStepIndex === recipe.steps.length - 1 && isStepCompleted(currentStepIndex))) && !showCompletion) {
      console.log('Condition de complétion remplie !');
      setShowCompletion(true);
      toast({
        title: "Félicitations !",
        description: "Vous avez terminé toutes les étapes de la recette !",
        duration: 5000,
      });
      return;
    }

    // Gérer la progression normale
    if (isStepCompleted(currentStepIndex)) {
      const timeoutId = setTimeout(() => {
        if (currentStepIndex < recipe.steps.length - 1) {
          goToNextStep();
          toast({
            title: "Étape complétée !",
            description: "Passage à l'étape suivante...",
            duration: 3000,
          });
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentStepIndex, isStepCompleted, showPreparation, recipe.steps.length, goToNextStep, toast, completedSteps, showCompletion]);

  // Ajouter un gestionnaire pour marquer une étape comme complétée
  const handleStepComplete = useCallback(() => {
    toggleStep(currentStepIndex);
    
    // Vérifier immédiatement après avoir marqué l'étape comme complétée
    const isLastStep = currentStepIndex === recipe.steps.length - 1;
    if (isLastStep) {
      const allStepsCompleted = Array.from({ length: recipe.steps.length }).every((_, index) => 
        index === currentStepIndex || isStepCompleted(index)
      );

      console.log('Vérification finale:', { isLastStep, allStepsCompleted });

      if (allStepsCompleted) {
        setShowCompletion(true);
        toast({
          title: "Félicitations !",
          description: "Vous avez terminé toutes les étapes de la recette !",
          duration: 5000,
        });
      }
    }
  }, [currentStepIndex, recipe.steps.length, isStepCompleted, toggleStep, toast]);

  // Ajouter un log pour déboguer la progression
  useEffect(() => {
    console.log('État actuel:', {
      currentStepIndex,
      totalSteps: recipe.steps.length,
      completedSteps: Array.from(completedSteps),
      showCompletion
    });
  }, [currentStepIndex, recipe.steps.length, completedSteps, showCompletion]);

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

  const adjustServings = useCallback((increment: boolean) => {
    setServings(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.max(1, newValue); // Empêcher les valeurs négatives
    });
  }, []);

  const handleKeyboardShortcut = useCallback((e: KeyboardEvent) => {
    if (showPreparation) return;
    
    switch(e.key) {
      case 'ArrowLeft':
        goToPreviousStep();
        break;
      case 'ArrowRight':
        goToNextStep();
        break;
      case ' ':
        e.preventDefault();
        if (stepDuration > 0) {
          toggleTimer();
        }
        break;
      case 'n':
      case 'N':
        e.preventDefault();
        toggleNotesVisibility();
        break;
      case '+':
        if (e.ctrlKey) {
          e.preventDefault();
          adjustServings(true);
        }
        break;
      case '-':
        if (e.ctrlKey) {
          e.preventDefault();
          adjustServings(false);
        }
        break;
    }
  }, [
    showPreparation,
    goToPreviousStep,
    goToNextStep,
    stepDuration,
    toggleTimer,
    toggleNotesVisibility,
    adjustServings
  ]);

  // Modifier le rendu du StepDisplay
  const renderStepDisplay = useCallback(() => (
    <StepDisplay
      description={currentStep.description}
      currentIndex={currentStepIndex}
      totalSteps={recipe.steps.length}
      isCompleted={isStepCompleted(currentStepIndex)}
      onToggleComplete={handleStepComplete}
      duration={stepDuration}
      temperature={currentStep.temperature}
      direction={direction}
    />
  ), [currentStep, currentStepIndex, recipe.steps.length, isStepCompleted, handleStepComplete, stepDuration, direction]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col"
      data-testid="cooking-mode"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="shrink-0"
            data-testid="close-cooking-mode-button"
          >
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold truncate">{recipe.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {isEnabled && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="shrink-0"
              data-testid="fullscreen-button"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-4rem)] flex flex-col">
        {showPreparation ? (
          <PreparationMode 
            recipe={recipe} 
            onStart={() => setShowPreparation(false)}
            initialServings={servings}
            onServingsChange={setServings}
          >
            <Button
              data-testid="start-recipe"
              className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl h-12 px-8 py-2"
              onClick={() => setShowPreparation(false)}
            >
              Commencer la recette
            </Button>
          </PreparationMode>
        ) : showCompletion ? (
          <CompletionMode recipe={recipe} onClose={onClose} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Étapes de la recette */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleIngredientsVisibility}
                    className="relative"
                    data-testid="toggle-ingredients"
                  >
                    <ChefHat className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleNotesVisibility}
                    className="relative"
                    data-testid="toggle-notes"
                  >
                    <StickyNote className="h-4 w-4" />
                    {hasNotes && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Étape {currentStepIndex + 1} sur {recipe.steps.length}
                </div>
              </div>

              <div className="flex-1 relative">
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
                    className="absolute inset-0"
                  >
                    {renderStepDisplay()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation entre les étapes */}
              <nav 
                className="flex justify-between items-center mt-6 gap-4" 
                role="navigation"
                aria-label="Navigation des étapes"
                data-testid="step-navigation"
              >
                <Button
                  onClick={goToPreviousStep}
                  disabled={currentStepIndex === 0}
                  variant="outline"
                  className="flex items-center gap-2 min-w-[120px]"
                  data-testid="previous-step-button"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Précédent</span>
                </Button>

                {currentStep.duration && currentStep.duration > 0 && (
                  <StepTimer
                    duration={currentStep.duration}
                    isRunning={isTimerRunning}
                    onToggle={toggleTimer}
                    onReset={resetTimer}
                    onComplete={handleTimerComplete}
                  />
                )}

                <Button
                  onClick={goToNextStep}
                  disabled={currentStepIndex === recipe.steps.length - 1}
                  variant="outline"
                  className="flex items-center gap-2 min-w-[120px]"
                  data-testid="next-step-button"
                >
                  <span>Suivant</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </nav>
            </div>

            {/* Panneau latéral */}
            <div className="w-full lg:w-96">
              <AnimatePresence mode="wait">
                {showNotes && (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="h-full"
                  >
                    <Card className="p-4 h-full">
                      <StepNotes
                        currentStep={currentStepIndex + 1}
                        totalSteps={recipe.steps.length}
                        note={getNote(currentStepIndex)}
                        onNoteChange={(note: string) => updateNote(currentStepIndex, note)}
                        hasNoteForStep={hasNoteForStep}
                        onClose={() => setShowNotes(false)}
                      />
                    </Card>
                  </motion.div>
                )}
                {showIngredients && (
                  <motion.div
                    key="ingredients"
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="h-full"
                  >
                    <Card className="p-4 h-full relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowIngredients(false)}
                        className="absolute top-2 right-2 h-8 w-8"
                        data-testid="close-ingredients"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <IngredientsList
                        ingredients={recipe.ingredients}
                        defaultServings={recipe.servings}
                        servings={servings}
                        onToggleIngredient={toggleIngredient}
                        completedIngredients={completedIngredients}
                      />
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Dialogue de confirmation de sortie */}
      <ConfirmationDialog
        isOpen={showExitConfirmation}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExit}
        title="Quitter le mode cuisine"
        description="Êtes-vous sûr de vouloir quitter le mode cuisine ? Vos progrès ne seront pas sauvegardés."
        confirmLabel="Quitter"
        cancelLabel="Annuler"
      />
    </div>
  );
}; 