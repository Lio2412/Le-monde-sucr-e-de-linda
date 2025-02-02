import { Recipe } from '@/types/recipe';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const fetchOptions = {
  credentials: 'include' as const,
  headers: {
    'Content-Type': 'application/json'
  }
};

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  try {
    // Décode le slug pour gérer les caractères spéciaux
    const decodedSlug = decodeURIComponent(slug);
    console.log('Fetching recipe with slug:', decodedSlug);
    
    const response = await fetch(`${API_URL}/recipes/${decodedSlug}`, fetchOptions);
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Recipe not found');
        return null;
      }
      throw new Error('Erreur lors de la récupération de la recette');
    }
    const recipe = await response.json();
    console.log('Recipe found:', recipe);
    return recipe;
  } catch (error) {
    console.error('Erreur lors de la récupération de la recette:', error);
    return null;
  }
}

export async function getLatestRecipes(limit: number = 6): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_URL}/recipes?limit=${limit}`, fetchOptions);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des recettes');
    }
    const recipes = await response.json();
    return recipes;
  } catch (error) {
    console.error('Erreur lors de la récupération des recettes:', error);
    return [];
  }
}

export async function search(query: string): Promise<{ id: string, title: string }[]> {
  try {
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`, fetchOptions);
    if (!response.ok) {
      throw new Error('Erreur lors de la recherche');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return [];
  }
}

export const recipeService = { search, getRecipeBySlug, getLatestRecipes }; 