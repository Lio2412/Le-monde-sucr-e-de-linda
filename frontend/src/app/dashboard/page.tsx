'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bienvenue, {user?.prenom} !</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Section Profil */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Votre Profil</h3>
              <p className="text-gray-600">Nom: {user?.nom}</p>
              <p className="text-gray-600">Prénom: {user?.prenom}</p>
              <p className="text-gray-600">Pseudo: {user?.pseudo}</p>
              <p className="text-gray-600">Email: {user?.email}</p>
            </div>

            {/* Section Rôles */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Vos Rôles</h3>
              <div className="space-y-1">
                {user?.roles.map((role, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <span className="font-medium">{role.role.nom}</span>
                    <p className="text-xs text-gray-500">{role.role.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Actions Rapides */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Actions Rapides</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors">
                  Modifier mon profil
                </button>
                <button className="w-full px-4 py-2 text-sm text-primary bg-white border border-primary rounded hover:bg-gray-50 transition-colors">
                  Voir mes commandes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 