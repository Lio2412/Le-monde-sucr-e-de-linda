import Head from 'next/head';
import type { Recipe } from '@/data/mock-recipes';

interface RecipeMetadataProps {
  recipe: Recipe;
}

export function RecipeMetadata({ recipe }: RecipeMetadataProps) {
  const url = typeof window !== 'undefined' 
    ? `${window.location.origin}/recettes/${recipe.slug}`
    : `/recettes/${recipe.slug}`;

  const image = recipe.imageUrl || recipe.image;

  return (
    <Head>
      <title>{recipe.title} | Le Monde Sucré de Linda</title>
      <meta name="description" content={recipe.description} />
      {recipe.tags && <meta name="keywords" content={recipe.tags.join(', ')} />}
      
      <meta property="og:title" content={recipe.title} />
      <meta property="og:description" content={recipe.description} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:url" content={url} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={recipe.title} />
      <meta name="twitter:description" content={recipe.description} />
      {image && <meta name="twitter:image" content={image} />}

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Recipe',
          name: recipe.title,
          description: recipe.description,
          image: image,
          author: {
            '@type': 'Person',
            name: recipe.author || 'Linda'
          },
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          totalTime: recipe.totalTime,
          recipeCategory: recipe.category,
          keywords: recipe.tags?.join(', '),
          recipeIngredient: recipe.ingredients,
          recipeInstructions: recipe.instructions.map(instruction => ({
            '@type': 'HowToStep',
            text: instruction
          }))
        })}
      </script>
    </Head>
  );
}