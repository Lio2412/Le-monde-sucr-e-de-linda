'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Panel d'Administration</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Section Informations */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informations</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Administrateur :</span> {user?.prenom} {user?.nom}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email :</span> {user?.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Rôles :</span>{' '}
                {user?.roles.map(r => r.role.nom).join(', ')}
              </p>
            </div>
          </div>

          {/* Section Gestion des Utilisateurs */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Gestion des Utilisateurs</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors">
                Liste des Utilisateurs
              </button>
              <button className="w-full px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors">
                Créer un Utilisateur
              </button>
              <button className="w-full px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors">
                Gérer les Rôles
              </button>
            </div>
          </div>

          {/* Section Statistiques */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Utilisateurs Inscrits</p>
                <div className="text-2xl font-bold text-primary">0</div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Recettes Publiées</p>
                <div className="text-2xl font-bold text-primary">0</div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Commentaires</p>
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
              Valider les Recettes
            </button>
            <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
              Modérer les Commentaires
            </button>
            <button className="px-4 py-2 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700 transition-colors">
              Gérer les Catégories
            </button>
            <button className="px-4 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors">
              Paramètres du Site
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 