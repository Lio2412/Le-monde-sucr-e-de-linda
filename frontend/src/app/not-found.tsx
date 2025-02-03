'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Playfair_Display } from 'next/font/google';
import { Home, Search } from 'lucide-react';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function NotFound() {
  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-48 h-48 mx-auto mb-8"
        >
          <Image
            src="/images/404-cake.png"
            alt="Gâteau 404"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            className="object-contain"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-4xl font-bold text-pink-600 mb-4 ${playfair.className}`}
        >
          Oups ! Cette page s'est évaporée comme un soufflé raté
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-gray-600 mb-8"
        >
          La page que vous recherchez n'existe pas ou a été déplacée.
          Mais ne vous inquiétez pas, nous avons d'autres délicieuses recettes pour vous !
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-x-4"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>
          
          <Link
            href="/recettes"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-pink-600 bg-white hover:bg-pink-50 transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            Voir toutes les recettes
          </Link>
        </motion.div>
      </div>
    </main>
  );
} 