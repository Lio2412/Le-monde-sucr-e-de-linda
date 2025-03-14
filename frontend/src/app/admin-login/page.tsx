'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Préparation de l\'accès administrateur...');
  
  useEffect(() => {
    try {
      // Définir les informations d'authentification admin
      const adminUser = {
        id: '1',
        email: 'admin@example.com',
        nom: 'Admin',
        prenom: 'Admin',
        pseudo: 'admin',
        role: 'ADMIN',
        roles: [{ role: { nom: 'ADMIN', description: 'Administrateur' } }]
      };
      
      // Enregistrer dans localStorage
      console.log('Enregistrement des données admin dans localStorage');
      localStorage.setItem('auth_user', JSON.stringify(adminUser));
      
      // Définir le cookie d'authentification
      console.log('Définition du cookie auth_token');
      Cookies.set('auth_token', 'mock-token-admin', { path: '/', sameSite: 'strict' });
      
      setStatus('Connexion réussie. Redirection vers le dashboard administrateur...');
      
      // Rediriger vers le dashboard admin
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setStatus(`Erreur: ${error.message}`);
    }
  }, [router]);
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-gray-50 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Accès Administrateur</h1>
        <div className="bg-pink-100 p-4 rounded-lg border border-pink-200 mb-6">
          <p className="text-pink-800">
            {status}
          </p>
        </div>
        <div className="text-gray-600 text-sm">
          <p className="mb-2">
            <strong>Email:</strong> admin@example.com
          </p>
          <p className="mb-2">
            <strong>Rôle:</strong> Administrateur
          </p>
          <p className="mb-4">
            <strong>Token:</strong> mock-token-admin
          </p>
          <p className="text-xs text-gray-500">
            Cette page configure automatiquement les informations d'authentification administrateur 
            et vous redirige vers le dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
