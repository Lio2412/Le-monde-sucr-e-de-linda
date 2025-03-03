'use client';

import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVirtualizer } from '@tanstack/react-virtual';

// Définition du type Ingredient
interface Ingredient {
  name: string;
  quantity?: number;
  unit?: string;
}

interface IngredientsListProps {
  ingredients: Ingredient[] | string[];
  defaultServings: number;
  servings: number;
  onToggleIngredient?: (index: number) => void;
  completedIngredients?: Set<number>;
  onClose?: () => void;
}

// Fonction pour formater les nombres décimaux - déclarée en dehors du composant
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

// Fonction pour extraire la quantité, l'unité et le nom d'un ingrédient sous forme de chaîne
const parseIngredient = (ingredient: string): { quantity: number | null; unit: string; name: string } => {
  // Regex pour extraire la quantité (nombre), l'unité et le nom
  const regex = /^([\d.,/]+)?\s*([a-zéèêëàâäôöùûüç]+)?\s*(.+)$/i;
  const match = ingredient.match(regex);
  
  if (!match) {
    return { quantity: null, unit: '', name: ingredient };
  }
  
  const [, quantityStr, unit, name] = match;
  
  // Convertir la quantité en nombre
  let quantity: number | null = null;
  if (quantityStr) {
    // Gérer les fractions comme "1/2"
    if (quantityStr.includes('/')) {
      const [numerator, denominator] = quantityStr.split('/').map(Number);
      quantity = numerator / denominator;
    } else {
      // Remplacer la virgule par un point pour la conversion en nombre
      quantity = parseFloat(quantityStr.replace(',', '.'));
    }
  }
  
  return {
    quantity,
    unit: unit || '',
    name: name.trim()
  };
};

export function IngredientsList({ 
  ingredients, 
  defaultServings, 
  servings,
  onToggleIngredient,
  completedIngredients = new Set(),
  onClose
}: IngredientsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [progress, setProgress] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);

  // Mettre à jour la progression lorsque les ingrédients complétés changent
  useEffect(() => {
    if (!ingredients?.length) {
      setProgress(0);
    } else {
      setProgress((completedIngredients.size / ingredients.length) * 100);
    }
  }, [ingredients, completedIngredients]);

  // Memoize virtualizer configuration
  const rowVirtualizer = useVirtualizer({
    count: ingredients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Hauteur estimée de chaque élément
    overscan: 5 // Nombre d'éléments à pré-rendre
  });

  // Calculer les ingrédients ajustés
  const adjustedIngredients = useMemo(() => {
    if (!ingredients?.length) return [];
    
    return ingredients.map((ingredient) => {
      // S'adapter aux deux types de données possibles (string ou Ingredient)
      if (typeof ingredient === 'string') {
        const { quantity, unit, name } = parseIngredient(ingredient);
        
        if (quantity === null) {
          return { text: ingredient };
        }
        
        // Calculer la nouvelle quantité
        const ratio = servings / defaultServings;
        const rawQuantity = quantity * ratio;
        
        // Formater la quantité
        const adjustedQuantity = formatNumber(rawQuantity);
        
        return {
          name,
          unit,
          quantity,
          adjustedQuantity,
          originalText: ingredient
        };
      }
      
      // Pour les objets Ingredient complets
      const ingredientObj = ingredient as (typeof ingredient & { quantity?: number, unit?: string });
      if (!ingredientObj.quantity) {
        return { text: ingredientObj.name || String(ingredient) };
      }
      
      // Calculer la nouvelle quantité
      const ratio = servings / defaultServings;
      const rawQuantity = ingredientObj.quantity * ratio;
      
      // Formater la quantité
      const adjustedQuantity = formatNumber(rawQuantity);

      return {
        ...ingredientObj,
        adjustedQuantity,
        originalQuantity: ingredientObj.quantity
      };
    });
  }, [ingredients, servings, defaultServings]);

  // Memoize handler pour toggleIngredient
  const handleToggleIngredient = useCallback((index: number) => {
    if (onToggleIngredient) {
      onToggleIngredient(index);
    }
  }, [onToggleIngredient]);

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
            const index = virtualItem.index;
            const ingredient = adjustedIngredients[index];
            const isCompleted = completedIngredients.has(index);
            
            return (
              <div
                key={virtualItem.key}
                data-index={index}
                ref={rowVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                  willChange: 'transform'
                }}
              >
                <div className="flex items-center gap-3 py-2">
                  {onToggleIngredient ? (
                    <Checkbox
                      id={`ingredient-${index}`}
                      checked={isCompleted}
                      onCheckedChange={() => handleToggleIngredient(index)}
                      className="h-4 w-4"
                    />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-primary/50" />
                  )}
                  <label
                    htmlFor={`ingredient-${index}`}
                    className={cn(
                      "text-sm cursor-pointer",
                      isCompleted && "line-through text-muted-foreground"
                    )}
                  >
                    {typeof ingredient === 'string' 
                      ? ingredient 
                      : 'text' in ingredient 
                        ? ingredient.text
                        : 'adjustedQuantity' in ingredient && ingredient.adjustedQuantity
                          ? `${ingredient.adjustedQuantity} ${ingredient.unit || ''} ${ingredient.name || ''}`
                          : 'originalText' in ingredient
                            ? ingredient.originalText
                            : String(ingredient)}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 