'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Playfair_Display } from 'next/font/google';
import { Home, Search } from 'lucide-react';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function NotFound() {
  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animation du gâteau qui tombe */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10
          }}
          className="relative w-48 h-48 mx-auto mb-8"
        >
          <Image
            src="/images/404-cake.png"
            alt="Gâteau 404"
            fill
            className="object-contain"
          />
        </motion.div>

        {/* Texte animé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className={`text-6xl font-bold text-pink-600 mb-4 ${playfair.className}`}>
            404
          </h1>
          <h2 className={`text-2xl mb-6 text-gray-800 ${playfair.className}`}>
            Oups ! Cette page s'est évaporée comme un soufflé raté
          </h2>
          <p className="text-gray-600 mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
            <br />
            Mais ne vous inquiétez pas, nous avons d'autres délicieuses recettes pour vous !
          </p>
        </motion.div>

        {/* Boutons d'action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pink-500 rounded-full hover:bg-pink-100 transition-colors"
          >
            <Search className="w-5 h-5" />
            Rechercher une recette
          </Link>
        </motion.div>
      </div>
    </main>
  );
} 