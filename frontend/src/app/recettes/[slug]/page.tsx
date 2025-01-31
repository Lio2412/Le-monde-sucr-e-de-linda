import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { mockRecipes } from '@/data/mock-recipes';
import { RecipeClient } from './RecipeClient';

interface RecettePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: RecettePageProps): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug);
  console.log('Searching for recipe with slug:', decodedSlug);
  const recipe = mockRecipes.find(r => r.slug === decodedSlug);
  
  if (!recipe) {
    console.log('Available recipes:', mockRecipes.map(r => r.slug));
    return {
      title: 'Recette non trouvée | Le Monde Sucré de Linda',
    };
  }

  return {
    title: `${recipe.title} | Le Monde Sucré de Linda`,
    description: recipe.description,
  };
}

export default async function RecettePage({ params }: RecettePageProps) {
  const decodedSlug = decodeURIComponent(params.slug);
  console.log('Searching for recipe with slug:', decodedSlug);
  console.log('Available recipes:', mockRecipes.map(r => r.slug));
  
  const recipe = mockRecipes.find(r => {
    console.log('Comparing:', r.slug, 'with:', decodedSlug);
    return r.slug === decodedSlug;
  });

  if (!recipe) {
    console.log('Recipe not found for slug:', decodedSlug);
    notFound();
  }

  console.log('Recipe found:', recipe.title);
  return <RecipeClient recipe={recipe} />;
}
