'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface StepTimerProps {
  duration: number; // en minutes
  onComplete: () => void;
}

export function StepTimer({ duration, onComplete }: StepTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Conversion en secondes
  const [isRunning, setIsRunning] = useState(false);
  const [originalTitle] = useState(document.title);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const reset = useCallback(() => {
    setTimeLeft(duration * 60);
    setIsRunning(false);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          if (newTime === 0) {
            setIsRunning(false);
            onComplete();
          }
          return newTime;
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

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  const isComplete = timeLeft === 0;
  const isAtStart = timeLeft === duration * 60;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-4xl font-mono font-bold tabular-nums">
        {formatTime(timeLeft)}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTimer}
          disabled={isComplete}
          aria-label={isRunning ? 'Mettre en pause' : 'Démarrer'}
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          disabled={isComplete || isAtStart}
          aria-label="Réinitialiser"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 