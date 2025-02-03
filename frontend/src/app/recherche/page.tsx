'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { playfair } from '@/app/fonts';
import { Clock, ChefHat, Filter } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import RecipeCard from '@/components/recipe/RecipeCard';

// Données de démonstration
const categories = [
  'Gâteaux', 'Tartes', 'Biscuits', 'Viennoiseries', 
  'Chocolat', 'Desserts glacés', 'Sans gluten', 'Végétalien'
];

const difficulties = ['Facile', 'Intermédiaire', 'Avancé'];
const prepTimes = ['< 30 min', '30-60 min', '1-2h', '> 2h'];

const demoRecipes = [
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
  }
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* En-tête */}
          <div className="mb-12 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-3xl font-bold mb-4 ${playfair.className}`}
            >
              Recherche Avancée
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600"
            >
              Trouvez la recette parfaite en utilisant nos filtres avancés
            </motion.p>
          </div>

          {/* Barre de recherche */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une recette..."
                className="w-full px-12 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filtres */}
          <motion.div
            initial={false}
            animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="max-w-4xl mx-auto bg-pink-50 rounded-2xl p-6">
              {/* Catégories */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategories(prev =>
                          prev.includes(category)
                            ? prev.filter(c => c !== category)
                            : [...prev, category]
                        );
                      }}
                      className={`px-4 py-2 rounded-full text-sm ${
                        selectedCategories.includes(category)
                          ? 'bg-pink-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-pink-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulté et Temps */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <ChefHat className="w-5 h-5" />
                    Niveau de difficulté
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {difficulties.map(difficulty => (
                      <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(
                          selectedDifficulty === difficulty ? '' : difficulty
                        )}
                        className={`px-4 py-2 rounded-full text-sm ${
                          selectedDifficulty === difficulty
                            ? 'bg-pink-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-pink-100'
                        }`}
                      >
                        {difficulty}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Temps de préparation
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {prepTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(
                          selectedTime === time ? '' : time
                        )}
                        className={`px-4 py-2 rounded-full text-sm ${
                          selectedTime === time
                            ? 'bg-pink-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-pink-100'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Résultats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {demoRecipes.map(recipe => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
} 