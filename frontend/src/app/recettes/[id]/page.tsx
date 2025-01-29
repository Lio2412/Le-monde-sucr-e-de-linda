import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { RecipeShares } from '@/components/recipe/RecipeShares';
import { Clock, ChefHat, Users } from 'lucide-react';
import { getRecipeById } from '@/services/recipeService';

interface RecipePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const recipe = await getRecipeById(params.id);
  
  if (!recipe) {
    return {
      title: 'Recette non trouvée',
    };
  }

  return {
    title: `${recipe.title} - Le Monde Sucré de Linda`,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: [recipe.mainImage],
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const recipe = await getRecipeById(params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
        <p className="text-lg text-gray-600 mb-6">{recipe.description}</p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-pink-500" />
            <span>{recipe.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-pink-500" />
            <span>{recipe.difficulty}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            <span>{recipe.servings} personnes</span>
          </div>
        </div>
      </header>

      <div className="relative aspect-[16/9] mb-8 rounded-lg overflow-hidden">
        <OptimizedImage
          src={recipe.mainImage}
          alt={recipe.title}
          priority
          className="object-cover"
          width={1200}
          height={675}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Ingrédients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-pink-500">•</span>
                {ingredient}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Ustensiles</h2>
          <ul className="space-y-2">
            {recipe.equipment.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-pink-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, index) => (
            <li key={index} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-semibold">
                {index + 1}
              </span>
              <p className="flex-1">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 border-t pt-8">
        <RecipeShares recipeId={params.id} />
      </section>
    </article>
  );
} 
