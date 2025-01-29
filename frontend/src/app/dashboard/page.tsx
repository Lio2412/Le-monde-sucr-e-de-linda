'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Playfair_Display } from 'next/font/google';
import { Heart, User, MessageSquare, Settings } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RecipeCard from '@/components/recipes/RecipeCard';
import { useNewsletter } from '@/hooks/useNewsletter';
import { Avatar } from '@/components/ui/avatar';

const playfair = Playfair_Display({ subsets: ['latin'] });

// Données de démonstration
const favoriteRecipes = [
  {
    id: 1,
    title: "Tarte au Citron Meringuée",
    description: "Une tarte au citron traditionnelle, surmontée d'une meringue légère et aérienne.",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&h=1200&fit=crop",
    category: "Tartes",
    difficulty: "Intermédiaire",
    time: "1h30",
    rating: 4.8
  },
  {
    id: 2,
    title: "Macarons à la Vanille",
    description: "Des macarons délicats à la vanille de Madagascar, avec une ganache onctueuse.",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=1200&h=1200&fit=crop",
    category: "Biscuits",
    difficulty: "Avancé",
    time: "2h",
    rating: 4.5
  }
];

const userComments = [
  {
    id: 1,
    recipe: "Tarte au Citron Meringuée",
    content: "Délicieuse recette ! La crème au citron est parfaitement équilibrée.",
    date: "15/01/2024",
    likes: 3
  },
  {
    id: 2,
    recipe: "Macarons à la Vanille",
    content: "Les instructions sont très claires, merci !",
    date: "10/01/2024",
    likes: 2
  }
];

type Tab = 'favorites' | 'profile' | 'comments' | 'settings';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('favorites');
  const [notifications, setNotifications] = useState({
    newRecipes: true,
    comments: true
  });
  const { subscribe, unsubscribe } = useNewsletter();

  const handleNotificationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));

    if (name === 'newRecipes') {
      if (checked) {
        await subscribe('john.doe@example.com'); // TODO: Utiliser l'email de l'utilisateur connecté
      } else {
        await unsubscribe('john.doe@example.com'); // TODO: Utiliser l'email de l'utilisateur connecté
      }
    }
  };

  const tabs = [
    { id: 'favorites', label: 'Favoris', icon: Heart },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'comments', label: 'Commentaires', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* En-tête du dashboard */}
          <div className="mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-3xl font-bold mb-4 ${playfair.className}`}
            >
              Mon Espace Personnel
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600"
            >
              Gérez vos recettes favorites, votre profil et vos interactions
            </motion.p>
          </div>

          {/* Navigation */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as Tab)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu */}
          <div className="min-h-[400px]">
            {activeTab === 'favorites' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {favoriteRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} {...recipe} />
                ))}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-xl mx-auto"
              >
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo de profil
                    </label>
                    <div className="flex items-center gap-4">
                      <Avatar size={48} alt="Votre avatar" />
                      <button
                        type="button"
                        className="px-4 py-2 text-sm text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50"
                      >
                        Changer la photo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                        defaultValue="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                        defaultValue="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      defaultValue="john.doe@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition-colors"
                  >
                    Sauvegarder les modifications
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {userComments.map(comment => (
                  <div
                    key={comment.id}
                    className="p-6 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{comment.recipe}</h3>
                      <span className="text-sm text-gray-500">{comment.date}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{comment.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Heart className="w-4 h-4" />
                      <span>{comment.likes} likes</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-xl mx-auto space-y-8"
              >
                <div>
                  <h3 className="text-lg font-medium mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="newRecipes"
                        checked={notifications.newRecipes}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">
                        Recevoir les nouvelles recettes par email
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="comments"
                        checked={notifications.comments}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">
                        Notifications de réponses aux commentaires
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Confidentialité</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">
                        Profil public
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">
                        Afficher mes recettes favorites
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition-colors"
                >
                  Sauvegarder les préférences
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
} 