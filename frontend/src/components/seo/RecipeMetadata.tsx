import Head from 'next/head';
import type { Recipe } from '@/types/recipe';
import { generateMetadata } from '@/lib/metadata';

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

  return (
    <Head>
      <title>{metadata.title as string}</title>
      <meta name="description" content={metadata.description as string} />
      <meta name="keywords" content={metadata.keywords as string} />
      <meta property="og:title" content={metadata.openGraph?.title as string} />
      <meta property="og:description" content={metadata.openGraph?.description as string} />
      <meta property="og:image" content={metadata.openGraph?.images?.[0]?.url} />
      <meta property="og:url" content={metadata.openGraph?.url} />
      <meta name="twitter:title" content={metadata.twitter?.title as string} />
      <meta name="twitter:description" content={metadata.twitter?.description as string} />
      <meta name="twitter:image" content={metadata.twitter?.images?.[0]} />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Recipe',
          name: recipe.title,
          description: recipe.description,
          image: recipe.mainImage,
          author: {
            '@type': 'Person',
            name: recipe.author.name
          },
          datePublished: recipe.createdAt,
          dateModified: recipe.updatedAt,
          prepTime: `PT${recipe.preparationTime}M`,
          cookTime: `PT${recipe.cookingTime}M`,
          recipeCategory: recipe.category,
          keywords: recipe.tags.join(', '),
          recipeIngredient: recipe.ingredients.map(ing => `${ing.quantity}${ing.unit} ${ing.name}`),
          recipeInstructions: recipe.steps.map(step => ({
            '@type': 'HowToStep',
            text: step.description
          })),
          aggregateRating: recipe.rating ? {
            '@type': 'AggregateRating',
            ratingValue: recipe.rating.average,
            ratingCount: recipe.rating.count
          } : undefined
        })}
      </script>
    </Head>
  );
} 