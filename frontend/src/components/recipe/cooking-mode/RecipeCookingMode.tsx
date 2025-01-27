'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bell, Timer, Clock, X, Maximize2, Minimize2, StickyNote, Edit, Plus, Minus } from 'lucide-react';
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

export const RecipeCookingMode: React.FC<RecipeCookingModeProps> = ({
  recipe: initialRecipe,
  onClose,
}) => {
  // Ajouter les équipements par défaut si nécessaire
  const recipe = {
    ...initialRecipe,
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
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showPreparation, setShowPreparation] = useState(true);
  const [showIngredients, setShowIngredients] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [servings, setServings] = useState(recipe.servings || 1);

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
  const { addToHistory } = useRecipeHistory();
  const { isTablet } = useDeviceType();

  // Optimisation des effets
  useEffect(() => {
    const checkUnsavedChanges = () => {
      const hasNotes = Object.values(notes).some(note => note.trim() !== '');
      const hasCompletedSteps = completedSteps.size > 0;
      return hasNotes || hasCompletedSteps;
    };

    const unsavedChanges = checkUnsavedChanges();
    if (hasUnsavedChanges !== unsavedChanges) {
      setHasUnsavedChanges(unsavedChanges);
    }
  }, [notes, completedSteps]);

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

  const currentStep = recipe.steps[currentStepIndex];
  const stepDuration = currentStep?.duration || 0;

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

  // Optimisation de l'effet de progression automatique
  useEffect(() => {
    if (!isStepCompleted(currentStepIndex) || showPreparation) return;
    
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
  }, [currentStepIndex, isStepCompleted, showPreparation]);

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

  const adjustQuantity = (quantity: number) => {
    if (!recipe.servings) return quantity;
    return (quantity * servings) / recipe.servings;
  };

  const handleServingsChange = useCallback((newServings: number) => {
    if (newServings > 0) {
      setServings(newServings);
    }
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
        toggleTimer();
        break;
      case 'n':
      case 'N':
        e.preventDefault();
        toggleNotesVisibility();
        break;
      case '+':
        if (e.ctrlKey) {
          e.preventDefault();
          handleServingsChange(servings + 1);
        }
        break;
      case '-':
        if (e.ctrlKey) {
          e.preventDefault();
          handleServingsChange(servings - 1);
        }
        break;
    }
  }, [goToPreviousStep, goToNextStep, toggleTimer, toggleNotesVisibility, servings, handleServingsChange, showPreparation]);

  const isLastStep = currentStepIndex === recipe.steps.length - 1;
  const allStepsCompleted = progress === 100;

  const renderContent = () => {
    if (allStepsCompleted) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full text-center p-8"
        >
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto"
            >
              <Bell className="w-8 h-8 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Félicitations !</h2>
            <p className="text-muted-foreground mb-6">
              Vous avez terminé la recette "{recipe.title}" avec succès.
            </p>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p>Temps total : {recipe.preparationTime + recipe.cookingTime} minutes</p>
              <p>Difficulté : {recipe.difficulty}</p>
              <p>Portions : {servings}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose}>
              Quitter
            </Button>
            <Button onClick={() => {
              setCurrentStepIndex(0);
              setShowPreparation(true);
            }}>
              Recommencer
            </Button>
          </div>
        </motion.div>
      );
    }

    return (
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <StepDisplay
          key={currentStepIndex}
          description={currentStep.description}
          currentIndex={currentStepIndex}
          totalSteps={recipe.steps.length}
          isCompleted={isStepCompleted(currentStepIndex)}
          onToggleComplete={() => toggleStep(currentStepIndex)}
          duration={currentStep.duration}
          temperature={currentStep.temperature}
          direction={direction}
        />
      </AnimatePresence>
    );
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
                  <div className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
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
                  <KeyboardShortcutsDialog />
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
                    {renderContent()}
                    {!allStepsCompleted && currentStep.duration && currentStep.duration > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8"
                      >
                        <StepTimer 
                          duration={currentStep.duration || 0} 
                          onComplete={handleTimerComplete}
                          isRunning={isTimerRunning}
                          onToggle={toggleTimer}
                          onReset={resetTimer}
                        />
                      </motion.div>
                    )}
                  </div>
                </Card>

                {/* Liste des ingrédients */}
                {showIngredients && (
                  <Card className="lg:col-span-2 p-6">
                    <IngredientsList
                      ingredients={recipe.ingredients || []}
                      defaultServings={recipe.servings || 1}
                    />
                  </Card>
                )}

                {/* Colonne de droite - Notes */}
                <AnimatePresence>
                  {showNotes && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="lg:col-span-1"
                    >
                      <StepNotes
                        stepIndex={currentStepIndex}
                        note={getNote(currentStepIndex)}
                        onUpdateNote={updateNote}
                        onClose={toggleNotesVisibility}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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

      {isTablet && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 grid grid-cols-3 gap-4">
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(servings - 1)}
              aria-label="Diminuer les portions"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(servings + 1)}
              aria-label="Augmenter les portions"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              aria-label="Étape précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextStep}
              disabled={currentStepIndex === recipe.steps.length - 1}
              aria-label="Étape suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTimer}
              aria-label="Démarrer/Arrêter le minuteur"
            >
              <Timer className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleNotesVisibility}
              aria-label="Ajouter une note"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {recipe.image && (
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      )}
    </>
  );
}; 