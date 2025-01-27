import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
}

interface KeyboardShortcutsDialogProps {
  shortcuts: Shortcut[];
}

export function KeyboardShortcutsDialog({ shortcuts }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100"
          aria-label="Afficher les raccourcis clavier"
          title="Afficher les raccourcis clavier"
        >
          <Keyboard className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-labelledby="keyboard-shortcuts-title"
        aria-describedby="keyboard-shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle id="keyboard-shortcuts-title">Raccourcis clavier</DialogTitle>
          <DialogDescription id="keyboard-shortcuts-description">
            Liste des raccourcis clavier disponibles pour naviguer dans le mode cuisine.
            Utilisez ces raccourcis pour une expérience plus fluide.
          </DialogDescription>
        </DialogHeader>
        <div
          className="grid gap-4"
          role="list"
          aria-label="Liste des raccourcis clavier"
        >
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
              role="listitem"
            >
              <span className="text-sm text-muted-foreground" id={`shortcut-desc-${index}`}>
                {shortcut.description}
              </span>
              <kbd
                className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded"
                aria-labelledby={`shortcut-desc-${index}`}
              >
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 