'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock, ChefHat, UtensilsCrossed } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { IngredientsList } from './IngredientsList';
import { EquipmentItem } from './EquipmentItem';
import { motion } from 'framer-motion';

interface PreparationModeProps {
  recipe: Recipe;
  onStart?: () => void;
  children?: React.ReactNode;
}

export function PreparationMode({ recipe, onStart, children }: PreparationModeProps) {
  const totalTime = recipe.preparationTime + recipe.cookingTime;

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
        <div className="flex items-center gap-2 text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-full">
          <Clock className="w-5 h-5" />
          <span>Temps total : {totalTime} minutes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Ingrédients */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
              <ChefHat className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Ingrédients nécessaires</h3>
            </div>
            <IngredientsList
              ingredients={recipe.ingredients || []}
              defaultServings={recipe.servings || 1}
            />
          </Card>
        </motion.div>

        {/* Équipements */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Équipements recommandés</h3>
            </div>
            <ul className="space-y-2">
              {recipe.equipment?.map((item: string, index: number) => (
                <EquipmentItem key={index} name={item} />
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        className="flex justify-center"
        variants={itemVariants}
      >
        {children || (
          <button
            data-testid="start-recipe"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl h-12 px-8 py-2"
            onClick={onStart}
          >
            Commencer la recette
          </button>
        )}
      </motion.div>
    </motion.div>
  );
} 