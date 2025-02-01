'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import { playfair } from '@/app/fonts';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Recettes', href: '/recettes' },
  { name: 'Blog', href: '/blog' },
  { name: 'À propos', href: '/a-propos' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm"
    >
      {/* Barre décorative */}
      <div className="h-0.5 w-full bg-gradient-to-r from-pink-200/80 via-pink-300/80 to-pink-200/80"></div>
      
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Navigation principale">
        <div className="flex h-20 justify-between items-center">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex lg:flex-1"
          >
            <Link href="/" className="flex flex-col items-center group">
              <div className="relative">
                <span className={`text-2xl tracking-wide text-gray-800 ${playfair.className}`}>
                  Le Monde Sucré
                </span>
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-pink-300 to-pink-400 group-hover:w-full transition-all duration-300"></span>
              </div>
              <span className="text-xs tracking-[0.2em] uppercase text-pink-400 mt-0.5 font-light">
                de Linda
              </span>
            </Link>
          </motion.div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:text-pink-400 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </motion.div>
            </button>
          </div>

          {/* Desktop navigation */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:flex lg:gap-x-1"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative text-sm font-medium leading-6 transition-all duration-200 px-5 py-2 rounded-lg ${
                  pathname === item.href
                    ? 'text-pink-500 bg-pink-50'
                    : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </motion.div>

          {/* Desktop login/logout button */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex lg:flex-1 lg:justify-end"
          >
            {user ? (
              <button
                onClick={handleLogout}
                className="relative inline-flex items-center gap-x-2 text-sm font-medium leading-6 px-6 py-2.5 rounded-lg bg-pink-400 text-white hover:bg-pink-500 transition-colors duration-200"
              >
                <span>Déconnexion</span>
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/connexion"
                className="relative inline-flex items-center gap-x-2 text-sm font-medium leading-6 px-6 py-2.5 rounded-lg bg-pink-400 text-white hover:bg-pink-500 transition-colors duration-200"
              >
                <span>Connexion</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
              </Link>
            )}
          </motion.div>
        </div>

        {/* Mobile menu */}
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: mobileMenuOpen ? 1 : 0,
            height: mobileMenuOpen ? 'auto' : 0
          }}
          transition={{ duration: 0.2 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="space-y-2 px-2 pb-4 pt-2">
            {navigation.map((item) => (
              <motion.div
                key={item.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`block rounded-lg px-4 py-2.5 text-base font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-pink-50 text-pink-500'
                      : 'text-gray-600 hover:bg-pink-50/50 hover:text-pink-500'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-center rounded-lg px-4 py-2.5 text-base font-medium bg-pink-400 text-white hover:bg-pink-500 transition-colors duration-200 mt-4"
                >
                  <span className="flex items-center justify-center gap-2">
                    Déconnexion
                    <LogOut className="h-4 w-4" />
                  </span>
                </button>
              ) : (
                <Link
                  href="/connexion"
                  className="block w-full text-center rounded-lg px-4 py-2.5 text-base font-medium bg-pink-400 text-white hover:bg-pink-500 transition-colors duration-200 mt-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
              )}
            </motion.div>
          </div>
        </motion.div>
      </nav>
    </motion.header>
  );
} 