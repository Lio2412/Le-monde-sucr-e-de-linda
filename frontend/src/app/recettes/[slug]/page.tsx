'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';
import { Clock, ChefHat, Users, Printer, Share2, Heart } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Loading from '@/components/ui/loading';
import type { Recipe } from '@/types/recipe';
import { motion, useScroll, useTransform } from 'framer-motion';

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function RecipePage({ params }: { params: { slug: string } }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const headerY = useTransform(scrollY, [0, 300], [0, 30]);
  const gradientOpacity = useTransform(scrollY, [0, 300], [0.6, 0.8]);

  useEffect(() => {
    // TODO: Remplacer par un appel API réel
    const fetchRecipe = async () => {
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecipe({
          id: 1,
          title: "Tarte au Citron Meringuée",
          slug: "tarte-citron-meringuee",
          description: "Une tarte au citron traditionnelle, surmontée d'une meringue légère et aérienne.",
          mainImage: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&h=1200&fit=crop",
          category: "Gâteaux",
          difficulty: "Moyen",
          preparationTime: 45,
          cookingTime: 30,
          servings: 8,
          ingredients: [
            { name: "Farine", quantity: 250, unit: "g" },
            { name: "Beurre", quantity: 125, unit: "g" },
            { name: "Sucre", quantity: 100, unit: "g" }
          ],
          steps: [
            { order: 1, description: "Préparer la pâte sablée..." },
            { order: 2, description: "Réaliser la crème au citron..." },
            { order: 3, description: "Monter la meringue..." }
          ],
          tags: ["Citron", "Meringue", "Dessert"],
          author: {
            id: "1",
            name: "Linda",
            avatar: "/images/linda.jpg"
          },
          published: true,
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Erreur lors du chargement de la recette:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [params.slug]);

  if (loading) {
    return <Loading />;
  }

  if (!recipe) {
    return <div>Recette non trouvée</div>;
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const fadeInUpTransition = {
    duration: 0.5
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <article className="pt-24 pb-16">
        {/* En-tête de la recette */}
        <motion.header 
          className="relative h-[60vh] min-h-[400px] mb-8 overflow-hidden"
        >
          <motion.div 
            style={{ y: headerY }}
            className="absolute inset-0"
          >
            <Image
              src={recipe.mainImage}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"
            style={{ opacity: gradientOpacity }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="max-w-4xl mx-auto text-white">
              <motion.h1 
                className={`text-4xl md:text-5xl lg:text-6xl mb-4 ${playfair.className}`}
                variants={fadeInUp}
                transition={fadeInUpTransition}
                initial="initial"
                animate="animate"
              >
                {recipe.title}
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-white/90 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {recipe.description}
              </motion.p>
            </div>
          </motion.div>
        </motion.header>

        {/* Contenu principal */}
        <div className="max-w-4xl mx-auto px-4">
          {/* Informations clés */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            {[
              { icon: Clock, text: `Préparation: ${recipe.preparationTime}min` },
              { icon: Clock, text: `Cuisson: ${recipe.cookingTime}min` },
              { icon: ChefHat, text: `Difficulté: ${recipe.difficulty}` },
              { icon: Users, text: `Pour ${recipe.servings} personnes` }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-2 text-gray-600"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div 
            className="flex gap-4 mb-12"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            {[
              { icon: Heart, text: "Sauvegarder", color: "pink" },
              { icon: Share2, text: "Partager", color: "gray" },
              { icon: Printer, text: "Imprimer", color: "gray" }
            ].map((action, index) => (
              <motion.button
                key={index}
                className={`flex items-center gap-2 px-4 py-2 text-${action.color}-500 hover:text-${action.color}-600 border border-${action.color}-200 hover:border-${action.color}-300 rounded-lg transition-colors`}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <action.icon className="w-5 h-5" />
                <span>{action.text}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Ingrédients */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className={`text-2xl mb-6 ${playfair.className}`}
              variants={fadeInUp}
            >
              Ingrédients
            </motion.h2>
            <motion.ul 
              className="grid gap-3"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {recipe.ingredients.map((ingredient, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-center gap-2 text-gray-600"
                  variants={fadeInUp}
                  whileHover={{ x: 10, transition: { type: "spring" } }}
                >
                  <span className="w-20 font-medium">{ingredient.quantity}{ingredient.unit}</span>
                  <span>{ingredient.name}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.section>

          {/* Étapes */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className={`text-2xl mb-6 ${playfair.className}`}
              variants={fadeInUp}
            >
              Préparation
            </motion.h2>
            <motion.div 
              className="grid gap-8"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {recipe.steps.map((step, index) => (
                <motion.div 
                  key={index} 
                  className="flex gap-4"
                  variants={fadeInUp}
                  whileHover={{ x: 10 }}
                >
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center font-medium"
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.order}
                  </motion.div>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Tags */}
          <motion.section 
            className="mb-12"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <motion.span
                  key={index}
                  className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.1 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </motion.section>
        </div>
      </article>

      <Footer />
    </main>
  );
} 