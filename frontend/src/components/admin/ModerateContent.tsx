'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface PendingContent {
  recipes: Array<{
    id: string;
    title: string;
    author: string;
    submittedAt: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    author: string;
    recipeTitle: string;
    createdAt: string;
  }>;
}

interface ModerateContentProps {
  pendingContent: PendingContent;
}

export default function ModerateContent({ pendingContent }: ModerateContentProps) {
  const handleApprove = async (type: 'recipe' | 'comment', id: string) => {
    // TODO: Implémenter l'approbation
    console.log(`Approuver ${type} ${id}`);
  };

  const handleReject = async (type: 'recipe' | 'comment', id: string) => {
    // TODO: Implémenter le rejet
    console.log(`Rejeter ${type} ${id}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recettes en attente</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingContent.recipes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aucune recette en attente
            </p>
          ) : (
            <div className="space-y-4">
              {pendingContent.recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{recipe.title}</p>
                    <p className="text-sm text-gray-500">par {recipe.author}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600"
                      onClick={() => handleApprove('recipe', recipe.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => handleReject('recipe', recipe.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Commentaires à modérer</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingContent.comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aucun commentaire à modérer
            </p>
          ) : (
            <div className="space-y-4">
              {pendingContent.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{comment.content}</p>
                    <p className="text-xs text-gray-500">
                      par {comment.author} sur "{comment.recipeTitle}"
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600"
                      onClick={() => handleApprove('comment', comment.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => handleReject('comment', comment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
