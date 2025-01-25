'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, Star, ChefHat, Heart } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'] });

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  time: string;
}

interface FeaturedRecipesProps {
  recipes: Recipe[];
}

export default function FeaturedRecipes({ recipes }: FeaturedRecipesProps) {
  return (
    <section className="relative py-16 lg:py-24 bg-white">
      {/* Décoration d'arrière-plan */}
      <div className="absolute inset-0 bg-[radial-gradient(#FFE1E1_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
      
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="relative max-w-7xl mx-auto px-4"
      >
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-medium tracking-wide text-pink-400 bg-pink-50 rounded-full">
              <Star className="w-4 h-4" />
              Nos meilleures recettes
            </span>
          </motion.div>
          <motion.h2 
            variants={fadeInUp}
            className={`text-3xl md:text-4xl font-bold mb-4 text-gray-900 ${playfair.className}`}
          >
            Recettes en vedette
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-gray-600"
          >
            Découvrez nos meilleures recettes, testées et approuvées par notre communauté.
          </motion.p>
        </div>

        {/* Grille de recettes */}
        <motion.div 
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {recipes.map((recipe, index) => (
            <motion.article 
              key={recipe.id}
              variants={fadeInUp}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Image de la recette */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Badge de catégorie */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-pink-300/90 backdrop-blur-sm rounded-lg">
                    {recipe.category}
                  </span>
                </div>

                {/* Bouton favori */}
                <button className="absolute top-4 right-4 p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-pink-400" />
                </button>

                {/* Titre sur l'image */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className={`text-2xl font-bold text-white mb-2 ${playfair.className}`}>
                    <Link href={`/recettes/${recipe.id}`} className="hover:text-pink-100 transition-colors">
                      {recipe.title}
                    </Link>
                  </h3>
                </div>
              </div>

              {/* Contenu de la recette */}
              <div className="p-6">
                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {recipe.description}
                </p>

                {/* Métadonnées */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-4 h-4" />
                      <span>{recipe.difficulty}</span>
                    </div>
                  </div>

                  {/* Lien "Voir la recette" */}
                  <Link 
                    href={`/recettes/${recipe.id}`}
                    className="inline-flex items-center text-sm font-medium text-pink-400 hover:text-pink-500 transition-colors"
                  >
                    <span>Voir</span>
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Lien vers toutes les recettes */}
        <motion.div 
          variants={fadeInUp}
          className="text-center mt-12"
        >
          <Link
            href="/recettes"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-white bg-pink-400 hover:bg-pink-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>Découvrir toutes nos recettes</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
} 