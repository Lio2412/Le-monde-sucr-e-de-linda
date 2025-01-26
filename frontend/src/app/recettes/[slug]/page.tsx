'use client';

import { Suspense, lazy } from 'react';
import { Playfair_Display } from 'next/font/google';
import { Clock, ChefHat, Users, Printer, Heart } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Loading from '@/components/ui/loading';
import { ShareButton } from '@/components/ui/share-button';
import { usePrint } from '@/hooks/usePrint';
import { RecipeMetadata } from '@/components/seo/RecipeMetadata';
import { OptimizedImage } from '@/components/ui/optimized-image';
import dynamic from 'next/dynamic';
import type { MotionComponents } from '@/components/providers';
import { useRecipe } from '@/hooks/useRecipe';

// Chargement différé des composants non-critiques
const RatingSection = lazy(() => import('@/components/recipes/RatingSection'));
const CommentSection = lazy(() => import('@/components/recipes/CommentSection'));

// Import dynamique de Framer Motion avec fallback
const MotionProvider = dynamic(
  () => import('@/components/providers').then(mod => mod.MotionProvider),
  {
    ssr: false,
    loading: () => <div className="animate-pulse"></div>
  }
);

const playfair = Playfair_Display({ subsets: ['latin'] });

// Configuration des tailles d'images pour différents breakpoints
const imageSizes = {
  hero: {
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 1200px, 2400px",
    quality: 90,
    priority: true
  },
  thumbnail: {
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality: 75,
    loading: "lazy" as const
  }
};

export default function RecipePage({ params }: { params: { slug: string } }) {
  const { recipe, isLoading, isError } = useRecipe(params.slug);
  const { printRecipe } = usePrint();
  
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

  if (isLoading) return <Loading />;
  if (isError) return <div>Erreur lors du chargement de la recette</div>;
  if (!recipe) return <div>Recette non trouvée</div>;

  return (
    <>
      <RecipeMetadata recipe={recipe} />
      <main className="min-h-screen bg-white">
        <Header />
        <MotionProvider>
          {({ motion, MotionHeader, MotionGradient }: MotionComponents) => (
            <article className="pt-24 pb-16">
              {/* En-tête de la recette */}
              <MotionHeader className="relative h-[60vh] min-h-[400px] mb-8 overflow-hidden">
                <div className="absolute inset-0">
                  <OptimizedImage
                    src={recipe.mainImage}
                    alt={recipe.title}
                    fill
                    variant="hero"
                    quality={90}
                    priority
                    containerClassName="absolute inset-0"
                  />
                </div>
                <MotionGradient className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
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
              </MotionHeader>

              {/* Contenu principal */}
              <div className="max-w-4xl mx-auto px-4">
                {/* Informations clés */}
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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
                    { icon: Heart, text: "Sauvegarder", color: "pink", onClick: () => {} },
                    { icon: Printer, text: "Imprimer", color: "gray", onClick: () => recipe && printRecipe(recipe) }
                  ].map((action, index) => (
                    <motion.button
                      key={index}
                      className={`flex items-center gap-2 px-4 py-2 text-${action.color}-500 hover:text-${action.color}-600 border border-${action.color}-200 hover:border-${action.color}-300 rounded-lg transition-colors`}
                      variants={fadeInUp}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={action.onClick}
                    >
                      <action.icon className="w-5 h-5" />
                      <span>{action.text}</span>
                    </motion.button>
                  ))}
                  <ShareButton 
                    url={`${window.location.origin}/recettes/${recipe.slug}`}
                    title={recipe.title}
                  />
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
                        key={step.order}
                        className="flex gap-4"
                        variants={fadeInUp}
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-medium">
                          {step.order}
                        </div>
                        <p className="flex-1 text-gray-700">{step.description}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>

                {/* Section de notation avec chargement différé */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="border-t border-gray-100 pt-8"
                >
                  <Suspense fallback={<div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>}>
                    <RatingSection
                      recipeId={recipe.id}
                      initialRating={4.5}
                      totalRatings={12}
                    />
                  </Suspense>
                </motion.div>

                {/* Section des commentaires avec chargement différé */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "100px" }}
                  className="border-t border-gray-100"
                >
                  <Suspense fallback={<div className="animate-pulse space-y-4">
                    <div className="h-24 bg-gray-100 rounded-lg"></div>
                    <div className="h-24 bg-gray-100 rounded-lg"></div>
                  </div>}>
                    <CommentSection
                      recipeId={recipe.id}
                      comments={[
                        {
                          id: '1',
                          author: {
                            name: 'Sophie',
                            avatar: '/images/default-avatar.png'
                          },
                          content: 'Délicieuse recette ! La crème au citron est parfaitement équilibrée.',
                          date: '15/01/2024',
                          likes: 3,
                          replies: [
                            {
                              id: '2',
                              author: {
                                name: 'Linda',
                                avatar: '/images/linda.jpg'
                              },
                              content: 'Merci Sophie ! Heureuse que la recette vous ait plu.',
                              date: '15/01/2024',
                              likes: 1
                            }
                          ]
                        }
                      ]}
                    />
                  </Suspense>
                </motion.div>

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
          )}
        </MotionProvider>
        <Footer />
      </main>
    </>
  );
} 