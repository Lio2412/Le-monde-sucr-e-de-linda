'use client';

import React, { useMemo, useRef } from 'react';
import { Ingredient } from '@/types/recipe';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVirtualizer } from '@tanstack/react-virtual';

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
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: ingredients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Hauteur estimée de chaque élément
    overscan: 5 // Nombre d'éléments à pré-rendre
  });

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
    <div className="space-y-4">
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
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2"
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

      <div 
        ref={parentRef}
        className="max-h-[60vh] overflow-auto"
        style={{
          height: `${Math.min(ingredients.length * 40, window.innerHeight * 0.6)}px`
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const ingredient = ingredients[virtualItem.index];
            const quantity = (ingredient.quantity / defaultServings) * servings;
            
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`
                }}
              >
                <div className="flex items-center gap-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-primary/50" />
                  <span className="text-sm">
                    {quantity} {ingredient.unit} {ingredient.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 