'use client';

import { useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import { Search, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RecipeCard from '@/components/recipes/RecipeCard';

const playfair = Playfair_Display({ subsets: ['latin'] });

const categories = [
  { id: 'tous', name: 'Tous' },
  { id: 'gateaux', name: 'Gâteaux' },
  { id: 'tartes', name: 'Tartes' },
  { id: 'viennoiseries', name: 'Viennoiseries' },
  { id: 'biscuits', name: 'Biscuits' },
  { id: 'entremets', name: 'Entremets' }
];

const recipes = [
  {
    id: 1,
    title: "Tarte au Citron Meringuée",
    description: "Une tarte au citron traditionnelle, surmontée d'une meringue légère et aérienne.",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&h=1200&fit=crop",
    category: "Tartes",
    difficulty: "Intermédiaire",
    time: "1h30",
    rating: 4.8
  },
  {
    id: 2,
    title: "Macarons à la Vanille",
    description: "Des macarons délicats à la vanille de Madagascar, avec une ganache onctueuse.",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=1200&h=1200&fit=crop",
    category: "Biscuits",
    difficulty: "Avancé",
    time: "2h",
    rating: 4.5
  },
  {
    id: 3,
    title: "Gâteau au Chocolat",
    description: "Un gâteau au chocolat moelleux et intense, parfait pour les amateurs de cacao.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&h=1200&fit=crop",
    category: "Gâteaux",
    difficulty: "Facile",
    time: "45min",
    rating: 4.9
  }
];

export default function RecipesPage() {
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'tous' || recipe.category.toLowerCase() === selectedCategory;
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-pink-50 pt-24">
        <div className="container mx-auto px-4 py-16">
          <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold text-center mb-6`}>
            Nos Recettes
          </h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Découvrez notre collection de recettes de pâtisserie française, des classiques intemporels aux créations modernes.
          </p>
        </div>
      </section>

      {/* Filtres et Recherche */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          {/* Barre de recherche */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Rechercher une recette..."
              className="w-full pl-10 pr-4 py-2 border-b-2 border-gray-200 focus:border-pink-300 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2 top-3 w-5 h-5 text-gray-400" />
          </div>

          {/* Filtres par catégorie */}
          <div className="flex gap-2 items-center overflow-x-auto pb-2 w-full md:w-auto">
            <SlidersHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-pink-100 text-pink-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grille de recettes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
} 