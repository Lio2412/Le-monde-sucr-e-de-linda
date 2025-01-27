'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { Ingredient } from '@/types/recipe';

interface IngredientsListProps {
  ingredients: Ingredient[];
  servings: number;
}

export const IngredientsList: React.FC<IngredientsListProps> = ({
  ingredients,
  servings,
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const adjustServings = (delta: number) => {
    const newMultiplier = Math.max(0.5, servingsMultiplier + delta * 0.5);
    setServingsMultiplier(newMultiplier);
  };

  const formatQuantity = (quantity: number): string => {
    const adjustedQuantity = quantity * servingsMultiplier;
    return adjustedQuantity % 1 === 0
      ? adjustedQuantity.toString()
      : adjustedQuantity.toFixed(1);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Ingrédients</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-muted-foreground" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustServings(-1)}
            disabled={servingsMultiplier <= 0.5}
          >
            -
          </Button>
          <span className="text-sm font-medium min-w-[4rem] text-center">
            {Math.round(servings * servingsMultiplier)} pers.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustServings(1)}
          >
            +
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <ScrollArea className="h-[calc(100vh-500px)]">
          <ul className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <li
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  checkedIngredients.has(index) ? 'bg-muted/50' : 'hover:bg-muted/30'
                }`}
              >
                <Checkbox
                  id={`ingredient-${index}`}
                  checked={checkedIngredients.has(index)}
                  onCheckedChange={() => toggleIngredient(index)}
                />
                <label
                  htmlFor={`ingredient-${index}`}
                  className={`flex-1 cursor-pointer ${
                    checkedIngredients.has(index) ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  <span className="font-medium">{formatQuantity(ingredient.quantity)}</span>
                  {' '}
                  <span className="text-muted-foreground">{ingredient.unit}</span>
                  {' '}
                  {ingredient.name}
                </label>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
}; 