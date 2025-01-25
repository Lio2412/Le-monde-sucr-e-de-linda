'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const navigation = {
  main: [
    { name: 'Accueil', href: '/' },
    { name: 'Recettes', href: '/recettes' },
    { name: 'Blog', href: '/blog' },
    { name: 'À propos', href: '/a-propos' },
    { name: 'Contact', href: '/contact' },
    { name: 'Mentions légales', href: '/mentions-legales' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: Facebook,
    },
    {
      name: 'Instagram',
      href: '#',
      icon: Instagram,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <Link href={item.href} className="text-sm leading-6 text-gray-600 hover:text-pastry-600">
                {item.name}
              </Link>
            </div>
          ))}
        </nav>

        <div className="mt-10 flex justify-center space-x-10">
          {navigation.social.map((item) => (
            <Link key={item.name} href={item.href} className="text-gray-400 hover:text-pastry-600">
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} Le Monde Sucré de Linda. Tous droits réservés.
          </p>
          <div className="mt-4">
            <Link href="/newsletter" className="text-sm leading-5 text-gray-500 hover:text-pastry-600">
              S'abonner à la newsletter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 