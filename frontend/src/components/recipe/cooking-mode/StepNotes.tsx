'use client';

import React, { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, X, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StepNotesProps {
  currentStep: number;
  totalSteps: number;
  note: string;
  onNoteChange: (note: string) => void;
  hasNoteForStep: (stepIndex: number) => boolean;
  onClose?: () => void;
}

export function StepNotes({
  currentStep,
  totalSteps,
  note,
  onNoteChange,
  hasNoteForStep,
  onClose,
}: StepNotesProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onNoteChange(newValue);
      // Mettre à jour la position du curseur
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  }, [onNoteChange]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Notes pour l'étape {currentStep}</h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            data-testid="close-notes"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ajoutez vos notes ici..."
          className="flex-1 min-h-[200px] resize-none font-mono text-sm"
          data-testid="note-input"
        />

        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Notes par étape
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md transition-colors",
                  index === currentStep - 1 && "bg-primary/5",
                  hasNoteForStep(index) && "text-primary"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    hasNoteForStep(index) ? "bg-primary" : "bg-muted"
                  )}
                />
                <span className="text-sm">
                  Étape {index + 1}
                </span>
                {index === currentStep - 1 && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 