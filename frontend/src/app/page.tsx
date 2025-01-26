'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const playfair = Playfair_Display({ subsets: ['latin'] });

const featuredRecipes = [
  {
    id: 1,
    title: "Tarte au Citron Meringuée",
    description: "Une tarte au citron traditionnelle, surmontée d'une meringue légère et aérienne.",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&h=1200&fit=crop",
    category: "Desserts",
    difficulty: "Intermédiaire",
    time: "1h30"
  },
  {
    id: 2,
    title: "Macarons à la Vanille",
    description: "Des macarons délicats à la vanille de Madagascar, avec une ganache onctueuse.",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=1200&h=1200&fit=crop",
    category: "Petits Gâteaux",
    difficulty: "Avancé",
    time: "2h"
  },
  {
    id: 3,
    title: "Gâteau au Chocolat",
    description: "Un gâteau au chocolat moelleux et intense, parfait pour les amateurs de cacao.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&h=1200&fit=crop",
    category: "Gâteaux",
    difficulty: "Facile",
    time: "45min"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Style carré */}
      <section className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square">
            <Image
              src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=1200&h=1200&fit=crop"
              alt="Pâtisserie"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="text-center md:text-left">
            <span className="inline-block text-sm tracking-wider text-pink-400 mb-6">BIENVENUE</span>
            <h1 className={`text-4xl md:text-5xl font-light mb-6 text-gray-900 ${playfair.className}`}>
              Le Monde Sucré
              <span className="block text-2xl md:text-3xl text-pink-300 mt-2">de Linda</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Découvrez l'art de la pâtisserie française à travers des recettes authentiques et élégantes
            </p>
            <Link
              href="/recettes"
              className="inline-flex items-center px-6 py-3 text-pink-400 hover:text-pink-500 border-b-2 border-pink-200 hover:border-pink-400 transition-all duration-300"
            >
              Explorer nos recettes
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Catégories Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/recettes/gateaux" className="group">
              <div className="aspect-square relative overflow-hidden bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&h=800&fit=crop"
                  alt="Gâteaux"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-light">Gâteaux</span>
              </div>
            </Link>
            <Link href="/recettes/tartes" className="group">
              <div className="aspect-square relative overflow-hidden bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1519915028121-7d3463d20b13?q=80&w=800&h=800&fit=crop"
                  alt="Tartes"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-light">Tartes</span>
              </div>
            </Link>
            <Link href="/recettes/viennoiseries" className="group">
              <div className="aspect-square relative overflow-hidden bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&h=800&fit=crop"
                  alt="Viennoiseries"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-light">Viennoiseries</span>
              </div>
            </Link>
            <Link href="/recettes/biscuits" className="group">
              <div className="aspect-square relative overflow-hidden bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&h=800&fit=crop"
                  alt="Biscuits"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-light">Biscuits</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-light mb-4 text-gray-900 ${playfair.className}`}>
              Dernières Recettes
            </h2>
            <div className="w-20 h-px bg-pink-200 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredRecipes.map((recipe) => (
              <article key={recipe.id} className="group">
                <Link href={`/recettes/${recipe.id}`}>
                  <div className="aspect-square relative overflow-hidden mb-4">
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className={`text-xl mb-2 group-hover:text-pink-400 transition-colors ${playfair.className}`}>
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="text-center">
            <h2 className={`text-3xl font-light mb-6 text-gray-900 ${playfair.className}`}>
              Newsletter
            </h2>
            <p className="text-gray-600 mb-8">
              Recevez nos dernières recettes et astuces directement dans votre boîte mail.
            </p>
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-3 border-b-2 border-gray-200 focus:outline-none focus:border-pink-200 transition-colors bg-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 text-pink-400 hover:text-pink-500 border-b-2 border-pink-200 hover:border-pink-400 transition-colors"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 