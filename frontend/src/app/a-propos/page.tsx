'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Playfair_Display } from 'next/font/google';
import { Heart, Star, ChefHat } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { NewsletterForm } from '@/components/ui/newsletter-form';

const playfair = Playfair_Display({ subsets: ['latin'] });

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-medium tracking-wide text-pink-500 bg-pink-50 rounded-full"
            >
              <Heart className="w-4 h-4" />
              À propos de moi
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 ${playfair.className}`}
            >
              Le Monde Sucré de Linda
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Découvrez l'histoire derrière mes créations pâtissières et ma passion pour la cuisine
            </motion.p>
          </div>
        </div>
      </section>

      {/* Histoire Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square"
            >
              <Image
                src="https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1200&h=1200&fit=crop"
                alt="Linda en train de cuisiner"
                fill
                className="object-cover rounded-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className={`text-3xl ${playfair.className}`}>Mon Histoire</h2>
              <p className="text-gray-600">
                Passionnée de pâtisserie depuis mon plus jeune âge, j'ai toujours été fascinée par la magie qui opère en cuisine. Cette passion m'a conduite à me former auprès des meilleurs artisans pâtissiers de France.
              </p>
              <p className="text-gray-600">
                Aujourd'hui, je partage avec vous mes recettes préférées, mes astuces et mes découvertes pour vous permettre de réaliser de délicieuses pâtisseries chez vous.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valeurs Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl mb-4 ${playfair.className}`}>Mes Valeurs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chaque recette est créée avec passion et attention aux détails
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Passion",
                description: "Un amour inconditionnel pour la pâtisserie et le partage"
              },
              {
                icon: Star,
                title: "Qualité",
                description: "Des ingrédients soigneusement sélectionnés pour des résultats exceptionnels"
              },
              {
                icon: ChefHat,
                title: "Expertise",
                description: "Des techniques professionnelles adaptées à la cuisine maison"
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-pink-100">
                  <value.icon className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="text-xl mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-pink-50 p-8 rounded-2xl"
          >
            <h2 className={`text-3xl mb-4 ${playfair.className}`}>
              Restez connecté
            </h2>
            <p className="text-gray-600 mb-6">
              Inscrivez-vous à ma newsletter pour recevoir mes dernières recettes et astuces
            </p>
            <NewsletterForm className="max-w-md mx-auto" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 