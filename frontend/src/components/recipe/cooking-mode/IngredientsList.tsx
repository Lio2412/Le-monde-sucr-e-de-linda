'use client';

import React, { useMemo } from 'react';
import { Ingredient } from '@/types/recipe';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IngredientsListProps {
  ingredients: Ingredient[];
  defaultServings: number;
  servings: number;
  onToggleIngredient?: (index: number) => void;
  completedIngredients?: Set<number>;
  onClose?: () => void;
}

export function IngredientsList({ 
  ingredients, 
  defaultServings, 
  servings,
  onToggleIngredient,
  completedIngredients = new Set(),
  onClose
}: IngredientsListProps) {
  // Fonction pour formater les nombres décimaux
  const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) return num.toString();
    
    // Arrondir à 2 décimales maximum
    const rounded = Math.round(num * 100) / 100;
    
    // Convertir les fractions courantes
    const fractions: Record<number, string> = {
      0.25: '¼',
      0.5: '½',
      0.75: '¾',
      0.33: '⅓',
      0.67: '⅔'
    };
    
    for (const [decimal, fraction] of Object.entries(fractions)) {
      if (Math.abs(rounded - parseFloat(decimal)) < 0.01) {
        return fraction;
      }
    }
    
    return rounded.toString();
  };

  // Calculer les ingrédients ajustés
  const adjustedIngredients = useMemo(() => {
    if (!ingredients?.length) return [];
    
    return ingredients.map(ingredient => {
      // Calculer la nouvelle quantité
      const ratio = servings / defaultServings;
      const rawQuantity = ingredient.quantity * ratio;
      
      // Formater la quantité
      const adjustedQuantity = formatNumber(rawQuantity);

      return {
        ...ingredient,
        adjustedQuantity,
        originalQuantity: ingredient.quantity
      };
    });
  }, [ingredients, servings, defaultServings]);

  const progress = useMemo(() => {
    if (!ingredients?.length) return 0;
    return (completedIngredients.size / ingredients.length) * 100;
  }, [ingredients, completedIngredients]);

  if (!ingredients?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Aucun ingrédient disponible
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="ingredients-list">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Ingrédients</h3>
          <p className="text-sm text-muted-foreground">
            Pour {servings} {servings > 1 ? 'portions' : 'portion'}
          </p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            data-testid="close-ingredients"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Progress value={progress} className="h-2" />
        <span className="text-sm text-muted-foreground min-w-[4rem]">
          {completedIngredients.size}/{ingredients.length}
        </span>
      </div>

      <div className="space-y-3">
        {adjustedIngredients.map((ingredient, index) => (
          <div 
            key={`${ingredient.name}-${index}`} 
            className={cn(
              "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
              completedIngredients.has(index) && "bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              {onToggleIngredient && (
                <Checkbox
                  checked={completedIngredients.has(index)}
                  onCheckedChange={() => onToggleIngredient(index)}
                  aria-label={`Marquer ${ingredient.name} comme utilisé`}
                />
              )}
              <div className="flex flex-col">
                <span className={cn(
                  "text-sm font-medium",
                  ingredient.optional && "text-muted-foreground",
                  completedIngredients.has(index) && "line-through"
                )}>
                  {ingredient.name}
                </span>
                {ingredient.optional && (
                  <span className="text-xs text-muted-foreground">(optionnel)</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className={cn(
                  "text-sm font-medium tabular-nums",
                  completedIngredients.has(index) && "text-muted-foreground"
                )}
                data-testid={`ingredient-quantity-${index}`}
              >
                {ingredient.adjustedQuantity}
              </span>
              {ingredient.unit && (
                <span className={cn(
                  "text-sm text-muted-foreground",
                  completedIngredients.has(index) && "line-through"
                )}>
                  {ingredient.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 