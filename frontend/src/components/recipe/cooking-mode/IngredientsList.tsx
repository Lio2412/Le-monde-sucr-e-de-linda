'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Minus, Plus, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Ingredient } from '@/types/recipe';

interface IngredientsListProps {
  ingredients: Ingredient[];
  defaultServings: number;
}

export function IngredientsList({ ingredients, defaultServings }: IngredientsListProps) {
  const [servings, setServings] = useState(defaultServings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const adjustQuantity = (quantity: number) => {
    return ((quantity * servings) / defaultServings).toFixed(1).replace(/\.0$/, '');
  };

  const handleServingsChange = (delta: number) => {
    const newServings = servings + delta;
    if (newServings > 0) {
      setServings(newServings);
    }
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  return (
    <div className="space-y-6" data-testid="ingredients-list">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Ingrédients</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Portions :</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(-1)}
              disabled={servings <= 1}
              className="h-8 w-8"
              aria-label="Diminuer les portions"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{servings}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleServingsChange(1)}
              className="h-8 w-8"
              aria-label="Augmenter les portions"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        className="space-y-2"
      >
        {ingredients.map((ingredient, index) => (
          <motion.div
            key={`${ingredient.name}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={cn(
                "p-4 transition-colors",
                checkedIngredients.has(index) && "bg-primary/5"
              )}
            >
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={checkedIngredients.has(index)}
                  onCheckedChange={() => toggleIngredient(index)}
                  className={cn(
                    "h-5 w-5",
                    checkedIngredients.has(index) && "bg-primary border-primary text-primary-foreground"
                  )}
                />
                <div className="flex-1">
                  <span
                    className={cn(
                      "transition-colors",
                      checkedIngredients.has(index) && "text-muted-foreground line-through"
                    )}
                  >
                    {ingredient.name}
                  </span>
                  {ingredient.quantity && (
                    <span
                      className={cn(
                        "ml-2 text-sm",
                        checkedIngredients.has(index) ? "text-muted-foreground" : "text-primary"
                      )}
                    >
                      {adjustQuantity(ingredient.quantity)}
                      {ingredient.unit && ` ${ingredient.unit}`}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 