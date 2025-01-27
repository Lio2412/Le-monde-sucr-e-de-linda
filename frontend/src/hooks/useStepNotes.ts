import { useState, useCallback } from 'react';

interface UseStepNotesProps {
  totalSteps: number;
}

interface UseStepNotesReturn {
  notes: Record<number, string>;
  showNotes: boolean;
  hasNotes: boolean;
  getNote: (stepIndex: number) => string;
  hasNoteForStep: (stepIndex: number) => boolean;
  updateNote: (stepIndex: number, content: string) => void;
  toggleNotesVisibility: () => void;
}

export function useStepNotes({ totalSteps }: UseStepNotesProps): UseStepNotesReturn {
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [showNotes, setShowNotes] = useState(false);

  const updateNote = useCallback((stepIndex: number, content: string) => {
    setNotes(prev => {
      const newNotes = { ...prev };
      if (content.trim() === '') {
        delete newNotes[stepIndex];
      } else {
        newNotes[stepIndex] = content;
      }
      return newNotes;
    });
  }, []);

  const getNote = useCallback((stepIndex: number) => {
    return notes[stepIndex] || '';
  }, [notes]);

  const hasNoteForStep = useCallback((stepIndex: number) => {
    return Boolean(notes[stepIndex]?.trim());
  }, [notes]);

  const hasNotes = Object.values(notes).some(note => note.trim() !== '');

  const toggleNotesVisibility = useCallback(() => {
    setShowNotes(prev => !prev);
  }, []);

  return {
    notes,
    showNotes,
    hasNotes,
    getNote,
    hasNoteForStep,
    updateNote,
    toggleNotesVisibility,
  };
} 