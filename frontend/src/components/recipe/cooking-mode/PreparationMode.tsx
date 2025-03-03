'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, ChefHat, UtensilsCrossed, Plus, Minus } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { IngredientsList } from './IngredientsList';
import { EquipmentItem } from './EquipmentItem';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PreparationModeProps {
  recipe: Recipe;
  onStart: () => void;
  children?: React.ReactNode;
  initialServings?: number;
  onServingsChange?: (servings: number) => void;
}

export function PreparationMode({ 
  recipe, 
  onStart, 
  children,
  initialServings,
  onServingsChange 
}: PreparationModeProps) {
  const [servings, setServings] = useState(initialServings || recipe.servings || 1);
  const totalTime = parseInt(recipe.prepTime) + parseInt(recipe.cookTime);

  const adjustServings = (increment: boolean) => {
    const newValue = increment ? servings + 1 : servings - 1;
    const finalValue = Math.max(1, newValue);
    setServings(finalValue);
    onServingsChange?.(finalValue);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="h-full flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Préparation de la recette</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustServings(false)}
              disabled={servings <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">
              {servings} {servings > 1 ? 'parts' : 'part'}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustServings(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-full">
            <Clock className="w-5 h-5" />
            <span>Temps total : {totalTime} minutes</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Ingrédients nécessaires</h2>
          <Card className="p-6">
            <IngredientsList
              ingredients={recipe.ingredients}
              defaultServings={recipe.servings || 1}
              servings={servings}
            />
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Équipements recommandés</h2>
          <Card className="p-6">
            <div className="space-y-4">
              {recipe.equipment?.map((item: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary/50" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <motion.div 
        className="flex justify-center"
        variants={itemVariants}
      >
        {children || (
          <Button
            className="w-full"
            onClick={onStart}
          >
            Commencer la recette
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
} 