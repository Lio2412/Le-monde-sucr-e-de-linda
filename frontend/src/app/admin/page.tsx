'use client';

import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  ChefHat, 
  FileText, 
  MessageSquare,
  Eye,
  Star,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { name: 'Utilisateurs', value: '0', icon: Users, color: 'bg-blue-500' },
  { name: 'Recettes', value: '0', icon: ChefHat, color: 'bg-green-500' },
  { name: 'Articles', value: '0', icon: FileText, color: 'bg-purple-500' },
  { name: 'Commentaires', value: '0', icon: MessageSquare, color: 'bg-yellow-500' },
];

const recentActivity = [
  { id: 1, type: 'recette', title: 'Tarte au Citron Meringuée', status: 'en attente' },
  { id: 2, type: 'article', title: 'Les Secrets de la Pâte Feuilletée', status: 'publié' },
  { id: 3, type: 'commentaire', title: 'Nouveau commentaire sur Macarons', status: 'modération' },
];

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.prenom} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Voici un aperçu de votre activité aujourd'hui
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-lg bg-white p-5 shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contenu Principal */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Activité Récente */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg bg-white shadow"
        >
          <div className="p-6">
            <h2 className="text-base font-semibold text-gray-900">
              Activité Récente
            </h2>
            <div className="mt-6 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentActivity.map((item) => (
                  <li key={item.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {item.type === 'recette' && <ChefHat className="h-5 w-5 text-gray-400" />}
                        {item.type === 'article' && <FileText className="h-5 w-5 text-gray-400" />}
                        {item.type === 'commentaire' && <MessageSquare className="h-5 w-5 text-gray-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {item.status}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Métriques */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg bg-white shadow"
        >
          <div className="p-6">
            <h2 className="text-base font-semibold text-gray-900">
              Métriques
            </h2>
            <dl className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <dt className="flex items-center text-sm text-gray-600">
                  <Eye className="h-5 w-5 text-gray-400 mr-2" />
                  Vues Totales
                </dt>
                <dd className="text-sm font-semibold text-gray-900">0</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center text-sm text-gray-600">
                  <Star className="h-5 w-5 text-gray-400 mr-2" />
                  Recettes Favorites
                </dt>
                <dd className="text-sm font-semibold text-gray-900">0</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                  Taux d'Engagement
                </dt>
                <dd className="text-sm font-semibold text-gray-900">0%</dd>
              </div>
            </dl>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 