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

interface ShortcutProps {
  keys: string[];
  description: string;
}

const Shortcut = ({ keys, description }: ShortcutProps) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-sm text-gray-700">{description}</span>
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded"
          aria-label={`Touche ${key}`}
        >
          {key}
        </kbd>
      ))}
    </div>
  </div>
);

export function KeyboardShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Afficher les raccourcis clavier"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Raccourcis Clavier</DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer rapidement dans le mode cuisine.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4" role="list">
          <Shortcut keys={["←", "→"]} description="Naviguer entre les étapes" />
          <Shortcut keys={["Espace"]} description="Démarrer/Arrêter le minuteur" />
          <Shortcut keys={["Échap"]} description="Quitter le mode plein écran" />
          <Shortcut keys={["N"]} description="Ajouter une note à l'étape" />
          <Shortcut
            keys={["Ctrl", "+"]}
            description="Augmenter le nombre de portions"
          />
          <Shortcut
            keys={["Ctrl", "-"]}
            description="Diminuer le nombre de portions"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 