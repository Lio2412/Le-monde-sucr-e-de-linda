'use client';

import { Recette } from '@/types/recette';
import { convertToRecipe } from '@/lib/recipe-converter';
import { RecipeMetadata } from './RecipeMetadata';

interface RecipeMetadataAdapterProps {
  recipe: Recette;
}

export function RecipeMetadataAdapter({ recipe }: RecipeMetadataAdapterProps) {
  const convertedRecipe = convertToRecipe(recipe);
  return <RecipeMetadata recipe={convertedRecipe} />;
} 