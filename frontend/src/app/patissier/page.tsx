'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function PatissierPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRoles={['patissier']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Espace Pâtissier</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Section Profil Pâtissier */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Mon Profil Pâtissier</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Nom :</span> {user?.prenom} {user?.nom}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Pseudo :</span> {user?.pseudo}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email :</span> {user?.email}
              </p>
              <button className="mt-4 w-full px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors">
                Modifier mon profil
              </button>
            </div>
          </div>

          {/* Section Mes Recettes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Mes Recettes</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors">
                Créer une Nouvelle Recette
              </button>
              <button className="w-full px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors">
                Gérer Mes Recettes
              </button>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Recettes Publiées</p>
                <div className="text-2xl font-bold text-primary">0</div>
              </div>
            </div>
          </div>

          {/* Section Statistiques */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Mes Statistiques</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Vues Totales</p>
                <div className="text-2xl font-bold text-primary">0</div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Commentaires Reçus</p>
                <div className="text-2xl font-bold text-primary">0</div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Recettes Favorites</p>
                <div className="text-2xl font-bold text-primary">0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Actions Rapides */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors">
              Répondre aux Commentaires
            </button>
            <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
              Voir les Messages
            </button>
            <button className="px-4 py-2 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700 transition-colors">
              Gérer les Catégories
            </button>
            <button className="px-4 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors">
              Paramètres du Profil
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 