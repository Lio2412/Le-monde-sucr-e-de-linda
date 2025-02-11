import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChefHat, StickyNote, Maximize2, ChevronLeft, ChevronRight, Clock, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

interface CookingModeProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    ingredients: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
    }>;
    steps: Array<{
      id: string;
      description: string;
      duration: number;
    }>;
    cookingTime: number;
    difficulty: string;
    equipment: string[];
  };
  onClose: () => void;
}

export const CookingMode = ({ recipe, onClose }: CookingModeProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showIngredients, setShowIngredients] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const progress = (completedSteps.size / recipe.steps.length) * 100;

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const startTimer = useCallback((duration: number) => {
    setTimeRemaining(duration * 60);
    setTimerActive(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold truncate">{recipe.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-4rem)] flex flex-col">
        <motion.div
          className="h-full flex flex-col gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Préparation de la recette</h2>
            <div className="flex items-center gap-2 text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-full">
              <Clock className="w-5 h-5" />
              <span>Temps total : {recipe.cookingTime} minutes</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Progression de la recette</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="rounded-xl border bg-card text-card-foreground shadow p-6"
              >
                <div className="space-y-4">
                  <p className="text-lg">
                    {recipe.steps[currentStep].description}
                  </p>
                  {recipe.steps[currentStep].duration > 0 && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      <span>{recipe.steps[currentStep].duration} minutes</span>
                      {!timerActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startTimer(recipe.steps[currentStep].duration)}
                        >
                          Démarrer le minuteur
                        </Button>
                      )}
                      {timerActive && (
                        <span>{formatTime(timeRemaining)}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`step-${currentStep}`}
                      checked={completedSteps.has(recipe.steps[currentStep].id)}
                      onCheckedChange={(checked) => {
                        const newCompletedSteps = new Set(completedSteps);
                        if (checked) {
                          newCompletedSteps.add(recipe.steps[currentStep].id);
                        } else {
                          newCompletedSteps.delete(recipe.steps[currentStep].id);
                        }
                        setCompletedSteps(newCompletedSteps);
                      }}
                    />
                    <label htmlFor={`step-${currentStep}`}>
                      Marquer comme terminée
                    </label>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <nav className="flex justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((step) => step - 1)}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentStep((step) => step + 1)}
              disabled={currentStep === recipe.steps.length - 1}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </nav>
        </motion.div>
      </div>
    </div>
  );
}; 