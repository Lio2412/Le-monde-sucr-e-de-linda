import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { mockRecipes } from '@/data/mock-recipes';
import { RecipeClient } from './RecipeClient';

function normalizeSlug(slug: string): string {
  return decodeURIComponent(slug)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

interface RecettePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: RecettePageProps): Promise<Metadata> {
  const normalizedRequestSlug = normalizeSlug(params.slug);
  console.log('Normalized request slug:', normalizedRequestSlug);
  
  const recipe = mockRecipes.find(r => normalizeSlug(r.slug) === normalizedRequestSlug);
  
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
  const normalizedRequestSlug = normalizeSlug(params.slug);
  console.log('Normalized request slug:', normalizedRequestSlug);
  console.log('Available recipes:', mockRecipes.map(r => ({ 
    original: r.slug, 
    normalized: normalizeSlug(r.slug) 
  })));
  
  const recipe = mockRecipes.find(r => normalizeSlug(r.slug) === normalizedRequestSlug);

  if (!recipe) {
    console.log('Recipe not found for normalized slug:', normalizedRequestSlug);
    notFound();
  }

  console.log('Recipe found:', recipe.title);
  return <RecipeClient recipe={recipe} />;
}
