import Head from 'next/head';
import type { Recipe } from '@/types/recipe';
import { generateMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

interface RecipeMetadataProps {
  recipe: Recipe;
}

export function RecipeMetadata({ recipe }: RecipeMetadataProps) {
  const metadata = generateMetadata({
    title: recipe.title,
    description: recipe.description,
    keywords: [...recipe.tags, recipe.category],
    image: recipe.mainImage,
    type: 'article',
    url: typeof window !== 'undefined' 
      ? `${window.location.origin}/recettes/${recipe.slug}`
      : `/recettes/${recipe.slug}`
  });

  // Extraire les valeurs en toute sécurité
  const ogImage = metadata.openGraph?.images 
    ? (Array.isArray(metadata.openGraph.images) 
      ? String(metadata.openGraph.images[0]) 
      : String(metadata.openGraph.images))
    : undefined;

  const twitterImage = metadata.twitter?.images 
    ? (Array.isArray(metadata.twitter.images) 
      ? String(metadata.twitter.images[0]) 
      : String(metadata.twitter.images))
    : undefined;

  const ogUrl = metadata.openGraph?.url 
    ? String(metadata.openGraph.url) 
    : undefined;

  return (
    <Head>
      <title>{metadata.title as string}</title>
      <meta name="description" content={metadata.description as string} />
      <meta name="keywords" content={metadata.keywords as string} />
      <meta property="og:title" content={metadata.openGraph?.title as string} />
      <meta property="og:description" content={metadata.openGraph?.description as string} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta name="twitter:title" content={metadata.twitter?.title as string} />
      <meta name="twitter:description" content={metadata.twitter?.description as string} />
      <meta name="twitter:image" content={twitterImage} />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Recipe',
          name: recipe.title,
          description: recipe.description,
          image: recipe.mainImage,
          author: {
            '@type': 'Person',
            name: 'Linda'
          },
          prepTime: `PT${recipe.preparationTime}M`,
          cookTime: `PT${recipe.cookingTime}M`,
          recipeCategory: recipe.category,
          keywords: recipe.tags.join(', '),
          recipeIngredient: recipe.ingredients.map(ing => `${ing.quantity}${ing.unit} ${ing.name}`),
          recipeInstructions: recipe.steps.map(step => ({
            '@type': 'HowToStep',
            text: step.description
          }))
        })}
      </script>
    </Head>
  );
} 