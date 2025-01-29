import Image from 'next/image';
import Link from 'next/link';
import { Clock, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: {
    id: number;
    title: string;
    description: string;
    mainImage: string;
    category: string;
    difficulty: string;
    time: string;
  };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={recipe.mainImage}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between bg-white p-6">
        <div className="flex-1">
          <div className="flex items-center gap-x-3">
            <span className="inline-flex items-center rounded-full bg-pastel-pink-50 px-2 py-1 text-xs font-medium text-primary-dark">
              {recipe.category}
            </span>
            <div className="flex items-center gap-x-1 text-xs text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{recipe.time}</span>
            </div>
            <div className="flex items-center gap-x-1 text-xs text-gray-500">
              <ChefHat className="h-4 w-4" />
              <span>{recipe.difficulty}</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-900">
              <Link href={`/recettes/${recipe.id}`} className="hover:text-primary-DEFAULT transition-colors duration-200">
                {recipe.title}
              </Link>
            </h3>
            <p className="mt-3 text-base text-gray-500 line-clamp-2">
              {recipe.description}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href={`/recettes/${recipe.id}`}
            className="text-sm font-medium text-primary-DEFAULT hover:text-primary-dark transition-colors duration-200"
          >
            Voir la recette
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
} 