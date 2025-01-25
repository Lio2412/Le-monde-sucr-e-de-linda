'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Search, Heart, Clock, ChefHat } from 'lucide-react';
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

export default function HeroSection() {
  return (
    <section className="relative">
      {/* Bannière de recherche */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Rechercher une recette..."
              className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Section Héro */}
      <div className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white pt-24 pb-12 lg:pt-32 lg:pb-20">
        {/* Motif décoratif */}
        <div className="absolute inset-0 bg-[radial-gradient(#FFE1E1_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-medium tracking-wide text-pink-500 bg-pink-50 rounded-full">
                <Heart className="w-4 h-4" />
                Nouveau sur le blog
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="relative z-10"
            >
              <span className="block text-2xl text-gray-600 mb-2">Bienvenue dans</span>
              <span className={`block text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-2 ${playfair.className}`}>
                Le Monde Sucré
              </span>
              <span className={`block text-4xl md:text-5xl lg:text-6xl font-bold text-pink-400 ${playfair.className}`}>
                de Linda
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="mt-8 text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Découvrez des recettes de pâtisserie délicieuses et créatives,
              des astuces et des techniques pour réussir vos desserts comme un pro.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/recettes"
                className="group inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-white bg-pink-400 hover:bg-pink-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Explorer nos recettes</span>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/blog" 
                className="group inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-pink-500 bg-white border-2 border-pink-200 hover:border-pink-300 rounded-lg hover:bg-pink-50 transition-colors duration-200"
              >
                <span>Lire le blog</span>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Statistiques */}
            <motion.div 
              variants={fadeInUp}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { icon: ChefHat, label: 'Recettes', value: '100+' },
                { icon: Clock, label: 'Minutes', value: '30-60' },
                { icon: Heart, label: 'Favoris', value: '1k+' }
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md">
                  <stat.icon className="w-6 h-6 mx-auto mb-3 text-pink-400" />
                  <div className="font-semibold text-2xl text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 