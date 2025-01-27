import React from 'react';
import { Card, Button, Textarea } from '@/components/ui';
import { StickyNote, X } from 'lucide-react';

interface StepNotesProps {
  stepIndex: number;
  note: string;
  onUpdateNote: (stepIndex: number, content: string) => void;
  onClose: () => void;
}

export function StepNotes({
  stepIndex,
  note,
  onUpdateNote,
  onClose,
}: StepNotesProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Notes pour l'étape {stepIndex + 1}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-gray-100"
          aria-label="Fermer les notes"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={note}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateNote(stepIndex, e.target.value)}
        placeholder="Ajoutez vos notes ici..."
        className="min-h-[150px] resize-none"
      />
    </Card>
  );
} 