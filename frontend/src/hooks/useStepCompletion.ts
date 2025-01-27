import { useState, useCallback } from 'react';

interface UseStepCompletionProps {
  totalSteps: number;
}

export function useStepCompletion({ totalSteps }: UseStepCompletionProps) {
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

  const progress = Math.round((completedSteps.size / totalSteps) * 100);

  return {
    completedSteps,
    toggleStep,
    isStepCompleted,
    progress,
  };
} 