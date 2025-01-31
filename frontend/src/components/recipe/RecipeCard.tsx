import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    cookingTime: number;
    difficulty: string;
    image: string;
    slug: string;
    rating: number;
    numberOfRatings: number;
  };
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <article className="rounded-lg overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-shadow">
      <Link href={`/recettes/${recipe.slug}`} className="block">
        <div className="relative h-48">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-xl font-semibold">{recipe.title}</h3>
          <p className="text-muted-foreground line-clamp-2">{recipe.description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{recipe.cookingTime} min</span>
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
              {recipe.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="ml-1 font-medium">{recipe.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({recipe.numberOfRatings} avis)
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}; 