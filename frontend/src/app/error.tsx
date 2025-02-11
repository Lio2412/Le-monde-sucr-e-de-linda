'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Playfair_Display } from 'next/font/google';
import { Home, RefreshCcw } from 'lucide-react';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animation du fouet mélangeur */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="relative w-48 h-48 mx-auto mb-8"
        >
          <Image
            src="/images/maintenance.png"
            alt="Maintenance"
            width={500}
            height={500}
            priority
            className="mx-auto"
          />
        </motion.div>

        {/* Texte animé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className={`text-4xl font-bold text-pink-600 mb-4 ${playfair.className}`}>
            Oups ! Une pincée de patience...
          </h1>
          <h2 className={`text-2xl mb-6 text-gray-800 ${playfair.className}`}>
            Notre cuisine numérique a besoin d'un petit moment
          </h2>
          <p className="text-gray-600 mb-8">
            Une erreur inattendue s'est produite pendant la préparation de votre page.
            <br />
            Nos chefs travaillent activement pour résoudre ce petit souci technique !
          </p>
        </motion.div>

        {/* Boutons d'action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pink-500 rounded-full hover:bg-pink-100 transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </motion.div>

        {/* Message technique */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-sm text-gray-500"
        >
          Erreur : {error.message}
          {error.digest && <span className="block">ID : {error.digest}</span>}
        </motion.p>
      </div>
    </main>
  );
} 