import { Recipe } from '@/types/recipe';

export const getRecipeBySlug = async (slug: string): Promise<Recipe | null> => {
  try {
    console.log('Fetching recipe with slug:', slug);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/recipes/${slug}`;
    console.log('Full URL:', url);
    
    const response = await fetch(url, {
      cache: 'no-store'
    });
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(errorText || 'Recette non trouvée');
    }
    
    const data = await response.json();
    console.log('Recipe data:', data);
    return data;
  } catch (error) {
    console.error('Erreur fetch:', error);
    return null;
  }
};
