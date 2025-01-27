'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, UtensilsCrossed } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { IngredientsList } from './IngredientsList';

interface PreparationModeProps {
  recipe: Recipe;
  onStart?: () => void;
  children?: React.ReactNode;
}

export function PreparationMode({ recipe, onStart, children }: PreparationModeProps) {
  const totalTime = recipe.preparationTime + recipe.cookingTime;

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Préparation de la recette</h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" />
          <span>Temps total : {totalTime} minutes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Ingrédients */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Ingrédients nécessaires</h3>
          </div>
          <IngredientsList
            ingredients={recipe.ingredients || []}
            defaultServings={recipe.servings || 1}
          />
        </Card>

        {/* Équipements */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Équipements recommandés</h3>
          </div>
          <ul className="space-y-2">
            {recipe.equipment?.map((item: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex justify-center">
        {children || (
          <button
            data-testid="start-recipe"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            onClick={onStart}
          >
            Commencer la recette
          </button>
        )}
      </div>
    </div>
  );
} 