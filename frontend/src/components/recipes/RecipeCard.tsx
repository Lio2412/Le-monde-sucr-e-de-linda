import Image from 'next/image';
import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'] });

interface RecipeCardProps {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  time: string;
  rating: number;
}

export default function RecipeCard({
  id,
  title,
  description,
  image,
  category,
  difficulty,
  time,
  rating
}: RecipeCardProps) {
  return (
    <Link href={`/recettes/${id}`} className="group">
      <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-square relative">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className={`text-xl ${playfair.className} group-hover:text-pink-400 transition-colors`}>
              {title}
            </h3>
            <span className="bg-pink-50 text-pink-600 px-2 py-1 rounded text-sm">
              {rating}★
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{difficulty}</span>
            <span>{time}</span>
          </div>
        </div>
      </article>
    </Link>
  );
} 