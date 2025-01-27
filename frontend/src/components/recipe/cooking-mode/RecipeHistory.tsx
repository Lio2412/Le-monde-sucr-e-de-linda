import { useRecipeHistory } from '@/hooks/useRecipeHistory';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function RecipeHistory() {
  const { history, clearHistory } = useRecipeHistory();

  if (history.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Aucune recette dans l'historique</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Historique des recettes</h2>
        <Button variant="outline" onClick={clearHistory}>
          Effacer l'historique
        </Button>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {history.map((item) => (
            <Link
              key={item.id}
              href={`/recettes/${item.slug}`}
              className="block p-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.title}</span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(item.lastVisited), {
                    addSuffix: true,
                    locale: fr
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 