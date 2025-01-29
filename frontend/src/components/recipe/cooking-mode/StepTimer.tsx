'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface StepTimerProps {
  duration: number; // en minutes
  onComplete: () => void;
  isRunning?: boolean;
  onToggle?: () => void;
  onReset?: () => void;
}

export function StepTimer({ 
  duration, 
  onComplete,
  isRunning: externalIsRunning = false,
  onToggle,
  onReset,
}: StepTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [showControls, setShowControls] = useState(false);
  const [originalTitle] = useState(document.title);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const notifyTimerComplete = useCallback(() => {
    // Vibrer sur mobile si disponible
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Jouer un bip sonore natif
    try {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoODlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaRw0PVqzl77BeGQc9ltvyxnUoBSh+zPDaizsIGGS56+mjTxELTKXh8bllHgU1jdT0z3wvBSJ0xe/glEILElyx6OyrWRUIRJve8sFuJAUug8/z1YU2BRxqvu3mnEoPDlOq5O+zYRsGPJPY88p3KgUme8rx3I4+CRVht+rqpVMSC0mh4PK8aiAFM4nU8tGAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYGK4DN8tiIOQcZZ7zs56BODwxPpuPxtmQcBjiP1/PMeS0FI3fH8N+RQAoUXrTp66hWEwlGnt/yv2wiBDCG0fPTgzQGHm/A7eSaSQ0PVqzl77BeGQc9ltrzxnUoBSh9y/HajzsIGGS56+mjUREKTKPi8blnHgU1jdTy0HwvBSF0xPDglEQKElux6eyrWRUJQ5vd88FwJAQug8/z1YY2BRxqvu3mnEoPDlKq5e+zYRsGOpPX88p3KgUmecnw3Y4/CBVht+rqpVMSC0mh4PK8aiAFM4nS89GAMQYfccLv45ZGCxFYrufur1sXCECY3PLEcycFK4DN8tiIOQcZZ7rs56BODwxPpuPxtmQdBTiP1/PMeS0FI3bH8d+RQQkUXrTp66hWEwlGnt/yv2wiBDCG0fPTgzQGHm3A7eSaSQ0PVKzl77BeGQc9ltrzyHQpBSh9y/HajzsIGGS56+mjUREKTKPi8blnHwU1jdTy0HwvBSF0xPDglEQKElux6eyrWRUIQ5vd88NvJAQug8/z1YY3BRxqvu3mnEoPDlKq5e+zYRsGOpPX88p3KgUmecnw3Y8+CBVht+rqpVMSC0mh4PK8aiAFM4nS89GAMgUfccLv45ZGCxFYrufur1sXCECX3fLEcycFKw==';
      audio.play().catch(error => {
        console.warn('Impossible de jouer le son natif:', error);
      });
    } catch (error) {
      console.warn('Erreur lors de la lecture du son:', error);
    }

    // Notification système si disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Minuteur terminé !', {
        body: 'Le temps est écoulé !',
        icon: '/favicon.ico'
      });
    }
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Réinitialiser le timer quand la durée change
  useEffect(() => {
    setTimeLeft(duration * 60);
    setIsComplete(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [duration]);

  // Gérer le décompte du timer
  useEffect(() => {
    if (externalIsRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            notifyTimerComplete();
            setIsComplete(true);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [externalIsRunning, timeLeft, onComplete, notifyTimerComplete]);

  // Gérer le titre de la page
  useEffect(() => {
    if (externalIsRunning && timeLeft > 0) {
      document.title = `⏰ ${formatTime(timeLeft)} - ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [timeLeft, externalIsRunning, originalTitle, formatTime]);

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
    setTimeLeft(duration * 60);
    setIsComplete(false);
  }, [duration, onReset]);

  return (
    <motion.div
      className="relative min-w-[300px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card 
        className={cn(
          "p-4 transition-colors border-2 shadow-lg",
          externalIsRunning ? "bg-primary/5 border-primary shadow-primary/20" : "bg-background border-border",
          isComplete && "bg-green-50 border-green-500 shadow-green-500/20"
        )}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Affichage du temps */}
          <div className="flex items-center justify-center w-full">
            <div className={cn(
              "text-5xl font-bold tabular-nums tracking-tight",
              externalIsRunning && "text-primary",
              isComplete && "text-green-600"
            )}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-muted rounded-full h-2.5">
            <motion.div
              className={cn(
                "h-full rounded-full transition-colors",
                isComplete ? "bg-green-500" : "bg-primary"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Contrôles */}
          <div className="flex items-center gap-2">
            <Button
              variant={externalIsRunning ? "destructive" : "default"}
              size="lg"
              onClick={onToggle}
              className="min-w-[140px]"
              disabled={isComplete}
            >
              {externalIsRunning ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Démarrer
                </>
              )}
            </Button>
            {(externalIsRunning || timeLeft !== duration * 60) && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={timeLeft === duration * 60}
                className="px-3"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* État du timer */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isComplete ? (
              <>
                <Bell className="h-4 w-4 text-green-500 animate-bounce" />
                <span className="font-medium text-green-600">Minuteur terminé !</span>
              </>
            ) : (
              <>
                <Timer className={cn(
                  "h-4 w-4",
                  externalIsRunning && "text-primary animate-pulse"
                )} />
                <span>
                  {externalIsRunning ? "Minuteur en cours..." : "En attente"}
                </span>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 