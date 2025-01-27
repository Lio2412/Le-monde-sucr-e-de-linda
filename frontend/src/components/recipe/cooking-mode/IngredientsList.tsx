'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Minus, Plus } from 'lucide-react';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface IngredientsListProps {
  ingredients: Ingredient[];
  defaultServings: number;
}

export function IngredientsList({ ingredients, defaultServings }: IngredientsListProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [servings, setServings] = useState(defaultServings || 1);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleIngredient = (ingredientName: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(ingredientName)) {
      newChecked.delete(ingredientName);
    } else {
      newChecked.add(ingredientName);
    }
    setCheckedIngredients(newChecked);
  };

  const adjustQuantity = (quantity: number): string => {
    if (!quantity || !servings || !defaultServings) return '0';
    const adjusted = (quantity * servings) / defaultServings;
    return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(1);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Ingrédients</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setServings(Math.max(1, servings - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[3ch] text-center">{servings}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setServings(servings + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-2">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.name}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={ingredient.name}
                  checked={checkedIngredients.has(ingredient.name)}
                  onCheckedChange={() => toggleIngredient(ingredient.name)}
                />
                <label
                  htmlFor={ingredient.name}
                  className={`flex-1 ${
                    checkedIngredients.has(ingredient.name)
                      ? "text-muted-foreground line-through"
                      : ""
                  }`}
                >
                  {adjustQuantity(ingredient.quantity)} {ingredient.unit} {ingredient.name}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 