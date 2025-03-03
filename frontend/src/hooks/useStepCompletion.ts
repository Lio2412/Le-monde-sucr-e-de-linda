import { useState, useCallback, useMemo } from 'react';

interface UseStepCompletionProps {
  totalSteps: number;
}

interface UseStepCompletionReturn {
  completedSteps: Set<number>;
  isStepCompleted: (stepIndex: number) => boolean;
  toggleStep: (stepIndex: number) => void;
  progress: number;
}

export function useStepCompletion({ totalSteps }: UseStepCompletionProps): UseStepCompletionReturn {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);

  const toggleStep = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      
      const newProgress = Math.round((newSet.size / totalSteps) * 100);
      setProgress(newProgress);
      
      return newSet;
    });
  }, [totalSteps]);

  const isStepCompleted = useCallback((stepIndex: number) => {
    return completedSteps.has(stepIndex);
  }, [completedSteps]);

  return {
    completedSteps,
    isStepCompleted,
    toggleStep,
    progress,
  };
} 