import { prisma } from '@/lib/prisma';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  time: string;
  difficulty: string;
  servings: number;
  ingredients: string[];
  equipment: string[];
  steps: string[];
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: true,
        equipment: true,
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!recipe) {
      return null;
    }

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      mainImage: recipe.mainImage,
      time: recipe.time,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      ingredients: recipe.ingredients.map(i => i.text),
      equipment: recipe.equipment.map(e => e.name),
      steps: recipe.steps.map(s => s.text)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la recette:', error);
    return null;
  }
}

export async function getLatestRecipes(limit: number = 6): Promise<Recipe[]> {
  try {
    const recipes = await prisma.recipe.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        ingredients: true,
        equipment: true,
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      mainImage: recipe.mainImage,
      time: recipe.time,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      ingredients: recipe.ingredients.map(i => i.text),
      equipment: recipe.equipment.map(e => e.name),
      steps: recipe.steps.map(s => s.text)
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des recettes:', error);
    return [];
  }
} 