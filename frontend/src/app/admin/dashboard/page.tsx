'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user, isLoading, error } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isLoading) {
        setIsCheckingAuth(true);
        try {
          if (!user) {
            router.replace('/auth/login');
            return;
          }

          const isAdmin = user.roles?.some(userRole => 
            userRole.role.nom.toUpperCase() === 'ADMIN'
          );

          if (!isAdmin) {
            router.replace('/acces-refuse');
            return;
          }
        } finally {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAdminAccess();
  }, [user, isLoading, router]);

  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-600">Une erreur est survenue: {error}</p>
        </div>
      </div>
    );
  }

  if (!user || !user.roles?.some(ur => ur.role.nom.toUpperCase() === 'ADMIN')) {
    return null; // Let the useEffect handle the redirect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <p className="text-sm text-gray-600">
              Connecté en tant que : {user.email}
            </p>
          </div>
          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Bienvenue dans votre espace administrateur
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Ici vous pouvez gérer votre site et accéder à toutes les fonctionnalités d'administration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
