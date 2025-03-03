'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bell, Timer, Clock, X, Maximize2, Minimize2, StickyNote, Edit, Plus, Minus, ChefHat, Trophy, PartyPopper, Camera } from 'lucide-react';
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
import { ShareRecipeCompletion } from '@/components/recipe/cooking-mode/ShareRecipeCompletion';
import { useRecipeCache } from '@/hooks/useRecipeCache';
import { Progress } from '@/components/ui/progress';

interface RecipeCookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

interface CompletionModeProps {
  recipe: Recipe;
  onClose: () => void;
}

interface ShareData {
  image: File | null;
  comment: string;
  rating: number;
  recipeId: string;
}

export const CompletionMode: React.FC<CompletionModeProps> = ({ recipe, onClose }) => {
  const [showShare, setShowShare] = useState(false);
  const { toast } = useToast();

  const handleShare = async (data: ShareData) => {
    try {
      const formData = new FormData();
      if (data.image) {
        formData.append('image', data.image);
      }
      formData.append('comment', data.comment);
      formData.append('rating', data.rating.toString());
      formData.append('recipeId', data.recipeId);

      const response = await fetch('/api/recipes/share', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du partage');
      }

      toast({
        title: "Partage réussi !",
        description: "Votre réalisation a été partagée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      throw error;
    }
  };

  return (
    <>
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
              onClick={() => setShowShare(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 gap-2"
            >
              <Camera className="h-4 w-4" />
              Partager ma réalisation
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Terminer
            </Button>
          </div>
        </div>
      </motion.div>

      {showShare && (
        <ShareRecipeCompletion
          recipeTitle={recipe.title}
          recipeId={recipe.id}
          onClose={() => setShowShare(false)}
          onShare={handleShare}
        />
      )}
    </>
  );
};

// Composant simplifié PreparationMode adapté à notre structure de données
const SimplePreparationMode: React.FC<{
  recipe: Recipe;
  servings: number;
  setServings: React.Dispatch<React.SetStateAction<number>>;
  onComplete: () => void;
}> = ({ recipe, servings, setServings, onComplete }) => {
  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{recipe.title} - Préparation</h2>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Ingrédients</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setServings(Math.max(1, servings - 1))}
              disabled={servings <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{servings}</span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setServings(servings + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <IngredientsList 
          ingredients={recipe.ingredients}
          defaultServings={recipe.servings || 1}
          servings={servings}
        />
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Infos sur la recette</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Préparation: {recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span>Cuisson: {recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-muted-foreground" />
            <span>Difficulté: {recipe.difficulty}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={onComplete}
          className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl h-12 px-8 py-2"
        >
          Commencer la recette
        </Button>
      </div>
    </div>
  );
};

export const RecipeCookingMode: React.FC<RecipeCookingModeProps> = ({
  recipe: initialRecipe,
  onClose,
}) => {
  const { cacheRecipe, getCachedRecipe } = useRecipeCache();
  const { toast } = useToast();
  
  // Garantir que les valeurs initiales sont stables
  const recipeId = useMemo(() => initialRecipe?.id || '', [initialRecipe?.id]);
  
  // Utiliser les données en cache si disponibles, avec mémoisation stricte
  const recipe = useMemo(() => {
    if (!recipeId) return initialRecipe;
    
    const cachedData = getCachedRecipe(recipeId);
    if (cachedData) {
      console.log('Utilisation des données en cache pour la recette:', recipeId);
      return cachedData;
    }
    
    // Si pas de cache, utiliser la recette initiale et la mettre en cache
    if (initialRecipe.instructions?.length > 0) {
      // Mettre en cache uniquement si la recette contient des instructions valides
      cacheRecipe(initialRecipe);
    }
    return initialRecipe;
  }, [recipeId, getCachedRecipe, cacheRecipe, initialRecipe]);

  // Initialiser les états avec des valeurs par défaut pour éviter des changements inutiles
  const initialServings = useMemo(() => recipe.servings || 1, [recipe.servings]);
  
  // Toujours déclarer tous les états en haut
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showPreparation, setShowPreparation] = useState(true);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [servings, setServings] = useState(initialServings);
  const [completedIngredients, setCompletedIngredients] = useState<Set<number>>(new Set());
  const [showCompletion, setShowCompletion] = useState(false);

  // Créer une référence stable et mutable pour le conteneur
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hooks optimisés avec des références stables
  const { isFullscreen, toggleFullscreen, isEnabled } = useFullscreen(containerRef);
  const { completedSteps, isStepCompleted, toggleStep, progress } = useStepCompletion({
    totalSteps: recipe.instructions?.length || 0,
  });
  const {
    notes,
    updateNote,
    toggleNotesVisibility: toggleNotesPanel,
    hasNotes,
    getNote,
    hasNoteForStep,
  } = useStepNotes({
    totalSteps: recipe.instructions?.length || 0,
  });
  const { addToHistory } = useRecipeHistory();
  const { isTablet } = useDeviceType();

  // Callbacks stabilisés
  const handleNextStep = useCallback(() => {
    if (currentStepIndex < (recipe.instructions?.length || 0) - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
      setDirection(1);
    } else {
      // Montrer l'écran de fin si c'est la dernière étape
      setShowCompletion(true);
    }
  }, [currentStepIndex, recipe.instructions?.length]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
      setDirection(-1);
    }
  }, [currentStepIndex]);

  const handleToggleIngredients = useCallback(() => {
    setShowIngredients(prev => !prev);
  }, []);

  const handleToggleNotes = useCallback(() => {
    setShowNotes(prev => !prev);
  }, []);

  const handleTogglePreparation = useCallback(() => {
    setShowPreparation(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitConfirmation(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  const handleConfirmExit = useCallback(() => {
    setShowExitConfirmation(false);
    onClose();
  }, [onClose]);

  const handleCancelExit = useCallback(() => {
    setShowExitConfirmation(false);
  }, []);

  // Traitement d'autres callbacks et logique du composant...
  
  // Assurer que les effets n'ont que des dépendances stables
  useEffect(() => {
    // Réinitialiser les changements lorsque le composant est monté
    setHasUnsavedChanges(false);
    
    // Nettoyer l'état à la fermeture
    return () => {
      setShowExitConfirmation(false);
      setShowCompletion(false);
    };
  }, []);

  // Si d'autres effets sont nécessaires...
  
  // Reste du composant...

  // Animations pour les transitions
  const slideVariants = useMemo(() => ({
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      transition: { duration: 0.3 }
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  }), []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
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
          <SimplePreparationMode 
            recipe={recipe}
            servings={servings}
            setServings={setServings}
            onComplete={() => setShowPreparation(false)}
          />
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
                    onClick={handleToggleIngredients}
                  >
                    <ChefHat className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleNotes}
                  >
                    <StickyNote className="h-4 w-4" />
                    {hasNotes && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Étape {currentStepIndex + 1} sur {recipe.instructions.length}
                </div>
              </div>

              <div className="flex-1 relative">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={currentStepIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{ 
                      position: 'absolute',
                      width: '100%',
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      transform: 'translate3d(0, 0, 0)' // Force GPU acceleration
                    }}
                  >
                    <Card className="p-6">
                      <div className="space-y-6">
                        {/* Barre de progression */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Progression de la recette</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        {/* Description de l'étape */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Étape {currentStepIndex + 1}</h3>
                          <p className="text-lg">{recipe.instructions[currentStepIndex]}</p>
                          
                          {/* Case à cocher */}
                          <div className="flex items-center space-x-2 mt-4">
                            <Checkbox
                              id={`step-${currentStepIndex}`}
                              checked={isStepCompleted(currentStepIndex)}
                              onCheckedChange={(checked) => {
                                if (checked === true && isStepCompleted(currentStepIndex)) return;
                                if (checked === false && !isStepCompleted(currentStepIndex)) return;
                                
                                if (checked === true || checked === false) {
                                  toggleStep(currentStepIndex);
                                }

                                // Vérifier si on devrait montrer l'écran de complétion
                                const isAllCompleted = Array.from({ length: recipe.instructions.length })
                                  .every((_, index) => index === currentStepIndex || isStepCompleted(index));
                                
                                if (isStepCompleted(currentStepIndex) && isAllCompleted && !showCompletion) {
                                  // Utiliser setTimeout au lieu de requestAnimationFrame pour éviter les problèmes de mise à jour
                                  setTimeout(() => {
                                    setShowCompletion(true);
                                    toast({
                                      title: "Félicitations !",
                                      description: "Vous avez terminé toutes les étapes de la recette !",
                                      duration: 5000,
                                    });
                                  }, 0);
                                }
                              }}
                              aria-label={`Marquer l'étape ${currentStepIndex + 1} comme terminée`}
                            />
                            <label
                              htmlFor={`step-${currentStepIndex}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              Marquer comme terminée
                            </label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation entre les étapes */}
              <nav 
                className="flex justify-between items-center mt-6 gap-4" 
                role="navigation"
                aria-label="Navigation des étapes"
              >
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  variant="outline"
                  className="flex items-center gap-2 min-w-[120px]"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Précédent</span>
                </Button>

                <Button
                  onClick={handleNextStep}
                  disabled={currentStepIndex === (recipe.instructions?.length || 0) - 1}
                  variant="outline"
                  className="flex items-center gap-2 min-w-[120px]"
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
                        totalSteps={recipe.instructions.length}
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
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <IngredientsList
                        ingredients={recipe.ingredients}
                        defaultServings={recipe.servings || 1}
                        servings={servings}
                        onToggleIngredient={(index: number) => {
                          setCompletedIngredients(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(index)) {
                              newSet.delete(index);
                            } else {
                              newSet.add(index);
                            }
                            return newSet;
                          });
                        }}
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