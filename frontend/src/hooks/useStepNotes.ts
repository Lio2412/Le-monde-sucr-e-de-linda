import { useState } from 'react';

interface UseStepNotesProps {
  totalSteps: number;
}

interface UseStepNotesReturn {
  notes: Record<number, string>;
  showNotes: boolean;
  updateNote: (step: number, note: string) => void;
  toggleNotesVisibility: () => void;
}

export function useStepNotes({ totalSteps }: UseStepNotesProps): UseStepNotesReturn {
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [showNotes, setShowNotes] = useState(false);

  const updateNote = (step: number, note: string) => {
    if (step < 0 || step >= totalSteps) {
      return;
    }

    setNotes(prev => {
      const newNotes = { ...prev };
      if (note.trim() === '') {
        delete newNotes[step];
      } else {
        newNotes[step] = note;
      }
      return newNotes;
    });
  };

  const toggleNotesVisibility = () => {
    setShowNotes(prev => !prev);
  };

  return {
    notes,
    showNotes,
    updateNote,
    toggleNotesVisibility,
  };
} 