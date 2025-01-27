'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function Footer() {
  return (
    <footer className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <div className="md:col-span-2">
            <Link href="/" className={`text-2xl font-light ${playfair.className}`}>
              Le Monde Sucré
            </Link>
            <p className="mt-4 text-gray-600">
              Découvrez l'art de la pâtisserie française à travers des recettes authentiques et élégantes.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-medium mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/recettes" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Recettes
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-gray-600 hover:text-pink-500 transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/recherche" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Recherche
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseaux Sociaux */}
          <div>
            <h3 className="font-medium mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Le Monde Sucré de Linda. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
} 