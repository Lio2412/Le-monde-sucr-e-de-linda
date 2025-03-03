'use client';

import { Suspense, lazy, useState, useEffect, useMemo, useCallback } from 'react';
import { Playfair_Display } from 'next/font/google';
import { Clock, ChefHat, Users, Printer, Heart, ChevronRight, UtensilsCrossed } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loading } from '@/components/ui/loading';
import { ShareButton } from '@/components/social/ShareButton';
import { usePrint } from '@/hooks/usePrint';
import { RecipeMetadata } from '@/components/seo/RecipeMetadata';
import { OptimizedImage } from '@/components/ui/optimized-image';
import dynamic from 'next/dynamic';
import type { MotionComponents } from '@/components/providers';
import { RecipeCookingMode } from '@/components/recipe/cooking-mode/RecipeCookingMode';
import Image from 'next/image';
import { convertToUIComment } from '@/lib/comment-adapter';
import { motion } from 'framer-motion';
import { playfair } from '@/app/fonts';
import { Recipe } from '@/types/recipe';

// Chargement différé des composants non-critiques
const RatingSection = lazy(() => import('@/components/recipe/RatingSection'));
const CommentSection = lazy(() => import('@/components/recipe/CommentSection'));

// Import dynamique de Framer Motion avec fallback
const MotionProvider = dynamic(
  () => import('@/components/providers').then(mod => mod.MotionProvider),
  {
    ssr: false,
    loading: () => <div className="animate-pulse"></div>
  }
);

// Utiliser le type Recipe importé de @/types/recipe
// Cela garantit la cohérence des types dans toute l'application

export const RecipeClient = ({ recipe }: { recipe: Recipe }) => {
  const { printRecipe } = usePrint();
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [origin, setOrigin] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipeData, setRecipeData] = useState<Recipe | null>(null);
  
  // Callback mémorisé pour fermer le mode cuisine
  const handleCloseCookingMode = useCallback(() => {
    setIsCookingMode(false);
  }, []);

  // Callback mémorisé pour l'impression
  const handlePrintRecipe = useCallback(() => {
    if (recipeData && recipeData.id) {
      printRecipe(recipeData);
    }
  }, [recipeData, printRecipe]);

  // Callback mémorisé pour activer le mode cuisine
  const handleEnterCookingMode = useCallback(() => {
    setIsCookingMode(true);
  }, []);
  
  useEffect(() => {
    // Récupérer l'origine une seule fois au montage
    setOrigin(window.location.origin);
    
    if (!recipe) {
      setError('Recette non trouvée');
      setIsLoading(false);
      return;
    }

    try {
      // S'assurer que recipe a toutes les propriétés nécessaires
      const processedRecipe = {
        ...recipe,
        instructions: recipe.instructions || [],
        ingredients: recipe.ingredients || []
      };
      setRecipeData(processedRecipe);
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing recipe:', err);
      setError('Erreur lors du chargement de la recette');
      setIsLoading(false);
    }
  }, [recipe]);

  // Animations mémorisées pour éviter les recréations à chaque rendu
  const animations = useMemo(() => ({
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    },
    fadeInUpTransition: {
      duration: 0.5
    },
    staggerChildren: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  }), []);

  // Utiliser useMemo pour éviter de recréer l'objet recipe à chaque rendu
  const memoizedRecipe = useMemo(() => {
    if (!recipeData) return null;
    
    // Assurez-vous que toutes les propriétés requises existent
    const completeRecipe = {
      ...recipeData,
      slug: recipeData.slug || '',
      tags: recipeData.tags || [],
      totalTime: recipeData.totalTime || '0',
      category: recipeData.category || '',
      image: recipeData.image || '/images/default-recipe.jpg',
      rating: recipeData.rating || 0,
      author: recipeData.author || '',
      id: recipeData.id || '',
      createdAt: recipeData.createdAt || '',
      updatedAt: recipeData.updatedAt || ''
    };
    
    return completeRecipe as Recipe;
  }, [recipeData]);

  if (isLoading) return <div>Chargement...</div>;
  if (error || !recipeData) return <div className="text-red-500">{error || 'Erreur inconnue'}</div>;

  if (isCookingMode && memoizedRecipe) {
    return <RecipeCookingMode 
      recipe={memoizedRecipe} 
      onClose={handleCloseCookingMode} 
    />;
  }

  return (
    <>
      <RecipeMetadata recipe={recipeData} />
      <main className="min-h-screen bg-white">
        <div className="pt-32 pb-16">
          <MotionProvider>
            {(motionComponents) => (
              <article className="pt-24 pb-16">
                {/* En-tête de la recette */}
                <motionComponents.MotionHeader>
                  <div className="relative h-[60vh] min-h-[400px] mb-8 overflow-hidden">
                    <div className="absolute inset-0">
                      <Image
                        src={recipeData.image || '/images/default-recipe.jpg'}
                        alt={recipeData.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1200px, 2400px"
                        priority
                        quality={90}
                      />
                      <motionComponents.MotionGradient>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      </motionComponents.MotionGradient>
                    </div>
                    <motionComponents.motion.div 
                      className="absolute bottom-0 left-0 right-0 p-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="max-w-4xl mx-auto text-white">
                        <motionComponents.motion.h1 
                          className={`text-4xl md:text-5xl lg:text-6xl mb-4 ${playfair.className}`}
                          variants={animations.fadeInUp}
                          transition={animations.fadeInUpTransition}
                          initial="initial"
                          animate="animate"
                        >
                          {recipeData.title}
                        </motionComponents.motion.h1>
                        <motionComponents.motion.p 
                          className="text-lg md:text-xl text-white/90 max-w-2xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          {recipeData.description}
                        </motionComponents.motion.p>
                      </div>
                    </motionComponents.motion.div>
                  </div>
                </motionComponents.MotionHeader>

                {/* Contenu principal */}
                <div className="max-w-4xl mx-auto px-4">
                  {/* Informations clés */}
                  <motionComponents.motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-6 px-4 bg-white rounded-xl shadow-sm"
                    variants={animations.staggerChildren}
                    initial="initial"
                    animate="animate"
                  >
                    {[
                      { 
                        icon: Clock, 
                        label: "Préparation",
                        value: recipeData.prepTime,
                        unit: "min"
                      },
                      { 
                        icon: Clock, 
                        label: "Cuisson",
                        value: recipeData.cookTime,
                        unit: "min"
                      },
                      { 
                        icon: ChefHat, 
                        label: "Difficulté",
                        value: recipeData.difficulty,
                        unit: ""
                      },
                      { 
                        icon: Users, 
                        label: "Pour",
                        value: recipeData.servings,
                        unit: "pers."
                      }
                    ].map((item, index) => (
                      <motionComponents.motion.div 
                        key={index}
                        className="flex flex-col items-center text-center gap-2"
                        variants={animations.fadeInUp}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">{item.label}</span>
                          <span className="font-medium">
                            {item.value} {item.unit}
                          </span>
                        </div>
                      </motionComponents.motion.div>
                    ))}
                  </motionComponents.motion.div>

                  {/* Actions */}
                  <motionComponents.motion.div 
                    className="flex flex-wrap gap-4 mb-12"
                    variants={animations.staggerChildren}
                    initial="initial"
                    animate="animate"
                  >
                    <motionComponents.motion.button
                      className="flex items-center gap-2 px-4 py-2 text-primary hover:text-primary/90 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                      variants={animations.fadeInUp}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEnterCookingMode}
                    >
                      <UtensilsCrossed className="w-5 h-5" />
                      <span>Mode Cuisine</span>
                    </motionComponents.motion.button>
                    {/* Actions supplémentaires */}
                    <motionComponents.motion.button
                      className="flex items-center gap-2 px-4 py-2 text-pink-500 hover:text-pink-600 border border-pink-200 hover:border-pink-300 rounded-lg transition-colors"
                      variants={animations.fadeInUp}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Sauvegarder</span>
                    </motionComponents.motion.button>
                    <motionComponents.motion.button
                      className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-600 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
                      variants={animations.fadeInUp}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrintRecipe}
                    >
                      <Printer className="w-5 h-5" />
                      <span>Imprimer</span>
                    </motionComponents.motion.button>
                    {origin && (
                      <ShareButton 
                        url={`${origin}/recettes/${recipeData.slug}`}
                        title={recipeData.title}
                      />
                    )}
                  </motionComponents.motion.div>

                  {/* Ingrédients */}
                  <motionComponents.motion.section 
                    className="mb-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <motionComponents.motion.h2 
                      className={`text-2xl mb-6 ${playfair.className}`}
                      variants={animations.fadeInUp}
                    >
                      Ingrédients
                    </motionComponents.motion.h2>
                    <motionComponents.motion.ul
                      className="space-y-2"
                      variants={animations.staggerChildren}
                      initial="initial"
                      animate="animate"
                    >
                      {recipeData.ingredients.map((ingredient, index) => (
                        <motionComponents.motion.li 
                          key={index} 
                          className="flex items-center gap-2 text-gray-600"
                          variants={animations.fadeInUp}
                          whileHover={{ x: 10, transition: { type: "spring" } }}
                        >
                          <span>{ingredient}</span>
                        </motionComponents.motion.li>
                      ))}
                    </motionComponents.motion.ul>
                  </motionComponents.motion.section>

                  {/* Étapes */}
                  <motionComponents.motion.section 
                    className="mb-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <motionComponents.motion.h2 
                      className={`text-2xl mb-6 ${playfair.className}`}
                      variants={animations.fadeInUp}
                    >
                      Préparation
                    </motionComponents.motion.h2>
                    <motionComponents.motion.div 
                      className="space-y-6"
                      variants={animations.staggerChildren}
                      initial="initial"
                      animate="animate"
                    >
                      {recipeData.instructions.map((step, index) => (
                        <motionComponents.motion.div 
                          key={index}
                          className="flex gap-4"
                          variants={animations.fadeInUp}
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-medium">{index + 1}</span>
                          </div>
                          <p className="flex-1">{step}</p>
                        </motionComponents.motion.div>
                      ))}
                    </motionComponents.motion.div>
                  </motionComponents.motion.section>

                  {/* Sections supplémentaires */}
                  <Suspense fallback={<Loading />}>
                    <RatingSection recipeId={parseInt(recipeData.id || '0')} />
                    <CommentSection 
                      recipeId={parseInt(recipeData.id || '0')}
                      comments={[]} // Initialize with empty array since comments are loaded by the component
                    />
                  </Suspense>
                </div>
              </article>
            )}
          </MotionProvider>
        </div>
        <Footer />
      </main>
    </>
  );
};