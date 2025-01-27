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
        >
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raccourcis clavier</DialogTitle>
          <DialogDescription>
            Liste des raccourcis clavier disponibles pour naviguer dans le mode cuisine.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 