'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminInit() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Initialisation de l\'administrateur en cours...');

  useEffect(() => {
    const initAdmin = async () => {
      try {
        const response = await axios.get('/api/admin/init');
        console.log('Réponse de l\'initialisation:', response.data);
        
        setStatus('success');
        setMessage(response.data.message);
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          router.push('/connexion');
        }, 3000);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        setStatus('error');
        setMessage('Erreur lors de l\'initialisation de l\'administrateur. Veuillez réessayer.');
      }
    };

    initAdmin();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Initialisation Administrateur</h1>
        
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-green-600 font-medium mb-2">Succès!</p>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-gray-500 text-sm">Redirection vers la page de connexion...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <p className="text-red-600 font-medium mb-2">Erreur</p>
            <p className="text-gray-600 mb-4">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Cette page initialise le compte administrateur avec les identifiants suivants :</p>
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p><strong>Email :</strong> admin@example.com</p>
            <p><strong>Mot de passe :</strong> admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
