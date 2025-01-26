'use client';

import { useState, useEffect } from 'react';
import { Playfair_Display } from 'next/font/google';
import { useRouter } from 'next/navigation';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function TestErrorPage() {
  const [shouldError, setShouldError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (shouldError) {
      throw new Error("Ceci est une erreur de test");
    }
  }, [shouldError]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-4">
      <h1 className={`text-3xl font-bold mb-8 text-pink-600 ${playfair.className}`}>
        Page de Test d'Erreur
      </h1>
      <p className="mb-8 text-gray-600 text-center max-w-md">
        Cette page permet de tester l'affichage des pages d'erreur.
        <br />
        Choisissez le type d'erreur à simuler.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setShouldError(true)}
          className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
        >
          Déclencher l'erreur 500
        </button>
        <button
          onClick={() => router.push('/page-qui-nexiste-pas')}
          className="px-6 py-3 bg-white text-pink-500 border border-pink-200 rounded-full hover:bg-pink-50 transition-colors"
        >
          Tester la page 404
        </button>
      </div>
    </div>
  );
} 