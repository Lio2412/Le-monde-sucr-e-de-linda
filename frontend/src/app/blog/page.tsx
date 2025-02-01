'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { playfair } from '@/app/fonts';
import { Search, Filter } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import BlogCard from '@/components/blog/BlogCard';

// Données de démonstration
const blogPosts = [
  {
    id: 1,
    slug: 'secrets-macarons-parfaits',
    title: 'Les Secrets pour des Macarons Parfaits',
    excerpt: 'Découvrez les techniques essentielles pour réussir vos macarons à tous les coups. Des coques lisses, des pieds bien formés...',
    coverImage: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=1200',
    author: {
      name: 'Linda',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&fit=crop'
    },
    category: 'Techniques',
    readTime: 8,
    publishedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 2,
    slug: 'tarte-citron-meringuee',
    title: 'Tarte au Citron Meringuée : La Recette Traditionnelle',
    excerpt: 'Une recette classique de la pâtisserie française revisitée avec des astuces pour une meringue parfaitement stable...',
    coverImage: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200',
    author: {
      name: 'Linda',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&fit=crop'
    },
    category: 'Recettes',
    readTime: 12,
    publishedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 3,
    slug: 'chocolat-temperage',
    title: 'Guide Complet du Tempérage du Chocolat',
    excerpt: "Maîtrisez l'art du tempérage du chocolat pour des créations brillantes et croquantes. Toutes les températures et techniques expliquées...",
    coverImage: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1200',
    author: {
      name: 'Linda',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&fit=crop'
    },
    category: 'Techniques',
    readTime: 15,
    publishedAt: '2024-01-10T09:15:00Z'
  }
];

const categories = ['Tous', 'Recettes', 'Techniques', 'Conseils', 'Actualités'];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // Filtrer les articles
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 ${playfair.className}`}
            >
              Le Blog
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Découvrez mes derniers articles, conseils et astuces pour parfaire vos créations pâtissières
            </motion.p>
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Catégories */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Barre de recherche */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Liste des articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucun article ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
} 