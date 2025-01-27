'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  isRunning: externalIsRunning,
  onToggle,
  onReset,
}: StepTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Conversion en secondes
  const [isRunning, setIsRunning] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [originalTitle] = useState(document.title);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Utiliser l'état externe du timer s'il est fourni
  useEffect(() => {
    if (externalIsRunning !== undefined) {
      setIsRunning(externalIsRunning);
    }
  }, [externalIsRunning]);

  // Réinitialiser le timer quand la durée change
  useEffect(() => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      document.title = `${formatTime(timeLeft)} - ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [timeLeft, isRunning, originalTitle]);

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  const toggleTimer = useCallback(() => {
    if (onToggle) {
      onToggle();
    } else {
      setIsRunning(!isRunning);
    }
  }, [onToggle, isRunning]);

  const resetTimer = useCallback(() => {
    if (onReset) {
      onReset();
    }
    setIsRunning(false);
    setTimeLeft(duration * 60);
  }, [onReset, duration]);

  const isComplete = timeLeft === 0;
  const isAtStart = timeLeft === duration * 60;

  return (
    <motion.div
      className="relative"
      onHoverStart={() => setShowControls(true)}
      onHoverEnd={() => setShowControls(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className={cn(
        "rounded-lg p-6 transition-colors",
        isRunning ? "bg-primary/5" : "bg-muted"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer className={cn(
              "w-5 h-5 transition-colors",
              isRunning ? "text-primary animate-pulse" : "text-muted-foreground"
            )} />
            <span className="text-sm font-medium">Minuteur</span>
          </div>
          <AnimatePresence>
            {(showControls || !isRunning) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTimer}
                  className={cn(
                    "h-8 w-8",
                    isRunning ? "hover:bg-primary/20" : "hover:bg-primary/10"
                  )}
                >
                  {isRunning ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetTimer}
                  className="h-8 w-8"
                  disabled={timeLeft === duration * 60}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div className="text-3xl font-bold tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-muted-foreground">
              / {formatTime(duration * 60)}
            </div>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-primary/10">
            <motion.div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 