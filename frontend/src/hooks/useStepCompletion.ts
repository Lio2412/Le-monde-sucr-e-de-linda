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

  const toggleStep = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  }, []);

  const isStepCompleted = useCallback((stepIndex: number) => {
    return completedSteps.has(stepIndex);
  }, [completedSteps]);

  const progress = useMemo(() => {
    return Math.round((completedSteps.size / totalSteps) * 100);
  }, [completedSteps, totalSteps]);

  return {
    completedSteps,
    isStepCompleted,
    toggleStep,
    progress,
  };
} 