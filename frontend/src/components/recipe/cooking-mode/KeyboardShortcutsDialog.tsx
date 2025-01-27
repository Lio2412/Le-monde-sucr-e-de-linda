import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Keyboard } from 'lucide-react';

interface ShortcutGroup {
  key: string;
  description: string;
  enabled?: boolean;
}

interface KeyboardShortcutsDialogProps {
  shortcuts: {
    navigation: ShortcutGroup[];
    timer: ShortcutGroup[];
    display: ShortcutGroup[];
  };
}

export function KeyboardShortcutsDialog({ shortcuts }: KeyboardShortcutsDialogProps) {
  const renderShortcutGroup = (group: ShortcutGroup[]) => {
    return group.map((shortcut, index) => {
      if (shortcut.enabled === false) return null;
      return (
        <div key={index} className="flex justify-between items-center py-1">
          <span className="text-muted-foreground">{shortcut.description}</span>
          <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">
            {shortcut.key}
          </kbd>
        </div>
      );
    });
  };

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Raccourcis clavier</DialogTitle>
          <DialogDescription>
            Liste des raccourcis clavier disponibles pour naviguer dans le mode cuisine.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Navigation</h3>
            {renderShortcutGroup(shortcuts.navigation)}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Minuteur</h3>
            {renderShortcutGroup(shortcuts.timer)}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Affichage</h3>
            {renderShortcutGroup(shortcuts.display)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 