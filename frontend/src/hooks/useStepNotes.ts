import { useState, useCallback } from 'react';

interface UseStepNotesProps {
  totalSteps: number;
}

export function useStepNotes({ totalSteps }: UseStepNotesProps) {
  const [notes, setNotes] = useState<Map<number, string>>(new Map());
  const [showNotes, setShowNotes] = useState(false);

  const updateNote = useCallback((stepIndex: number, content: string) => {
    setNotes(prev => {
      const newNotes = new Map(prev);
      if (content.trim()) {
        newNotes.set(stepIndex, content);
      } else {
        newNotes.delete(stepIndex);
      }
      return newNotes;
    });
  }, []);

  const getNote = useCallback((stepIndex: number) => {
    return notes.get(stepIndex) || '';
  }, [notes]);

  const toggleNotesVisibility = useCallback(() => {
    setShowNotes(prev => !prev);
  }, []);

  const hasNotes = notes.size > 0;
  const hasNoteForStep = useCallback((stepIndex: number) => {
    return notes.has(stepIndex);
  }, [notes]);

  return {
    notes,
    showNotes,
    updateNote,
    getNote,
    toggleNotesVisibility,
    hasNotes,
    hasNoteForStep,
  };
} 