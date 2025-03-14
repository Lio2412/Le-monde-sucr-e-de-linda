'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { playfair } from '@/app/fonts';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  // Effet pour le compte à rebours de redirection
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      // Forcer un rafraîchissement complet de la page pour la redirection
      window.location.href = '/admin/dashboard';
    }
  }, [redirectCountdown]);

  useEffect(() => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      console.log('Tokens de session précédents supprimés');
    } catch (e) {
      console.error('Erreur lors du nettoyage des sessions:', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setDebugInfo(null);
    setLoading(true);

    try {
      setDebugInfo('Début de la tentative de connexion...');
      
      // Utiliser la route API Next.js plutôt que d'appeler directement le backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion');
      }

      setDebugInfo('Authentification réussie');
      
      // Stocker le token et les informations utilisateur
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      
      // Stocker le token dans un cookie pour le middleware
      document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 jours
      
      // Redirection en fonction du rôle
      const redirectPath = data.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
      setDebugInfo(`Redirection vers ${redirectPath} dans 3 secondes...`);
      setRedirectCountdown(3);
      
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      setDebugInfo(`Erreur: ${err.message}`);
      setError(err.message || 'Problème lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Fonction pour forcer une redirection immédiate (bouton de secours)
  const forceRedirection = () => {
    if (formData.email.includes('admin')) {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Image décorative */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 max-w-lg hidden lg:block"
            >
              <Image
                src="/images/admin/admin-login.jpg"
                alt="Desserts sucrés"
                width={580}
                height={580}
                className="rounded-2xl shadow-xl"
                priority
                unoptimized={true}
              />
            </motion.div>

            {/* Formulaire de connexion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 w-full max-w-md mx-auto lg:mx-0"
            >
              <div className="text-center lg:text-left mb-8">
                <h1 className={`${playfair.className} text-3xl text-pink-600 font-semibold mb-2`}>
                  Connexion Administrative
                </h1>
                <p className="text-gray-600">
                  Accédez à l'espace de gestion du Monde Sucré de Linda
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-pink-100">
                <form onSubmit={handleSubmit}>
                  {/* Alerte d'erreur */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                      <p>{error}</p>
                    </div>
                  )}

                  {/* Info de déboggage */}
                  {debugInfo && (
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded text-sm">
                      <p className="font-mono">{debugInfo}</p>
                      {redirectCountdown !== null && (
                        <div className="mt-2 text-center">
                          <p className="font-bold">Redirection dans {redirectCountdown} secondes...</p>
                          <button 
                            type="button" 
                            onClick={forceRedirection}
                            className="mt-2 text-xs underline text-blue-700 hover:text-blue-900"
                          >
                            Cliquez ici si vous n'êtes pas redirigé automatiquement
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Champ Email */}
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="votre@email.com"
                        data-testid="email-input"
                      />
                      <span className="absolute left-3 top-3.5 text-gray-400">
                        <Mail size={18} />
                      </span>
                    </div>
                  </div>

                  {/* Champ Mot de passe */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Mot de passe
                      </label>
                      <Link
                        href="/reset-password"
                        className="text-sm text-pink-600 hover:text-pink-800"
                      >
                        Mot de passe oublié?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="••••••••"
                        data-testid="password-input"
                      />
                      <span className="absolute left-3 top-3.5 text-gray-400">
                        <Lock size={18} />
                      </span>
                      <button
                        type="button"
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Case à cocher "Se souvenir de moi" */}
                  <div className="mb-6">
                    <div className="flex items-center">
                      <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                        Se souvenir de moi
                      </label>
                    </div>
                  </div>

                  {/* Bouton de connexion */}
                  <div className="mb-6">
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center bg-pink-600 hover:bg-pink-700 py-3 px-4 rounded-lg text-white font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-70"
                      disabled={loading || redirectCountdown !== null}
                      data-testid="login-button"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connexion en cours...
                        </span>
                      ) : redirectCountdown !== null ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Redirection en cours...
                        </span>
                      ) : (
                        'Se connecter'
                      )}
                    </button>
                  </div>

                  {/* Aide à la connexion */}
                  <div className="p-4 bg-blue-50 rounded-md mb-6">
                    <h3 className="text-sm font-medium text-blue-700 mb-1">Identifiants de test</h3>
                    <ul className="text-xs text-blue-600">
                      <li><strong>Admin:</strong> admin@example.com / admin123</li>
                      <li><strong>Utilisateur:</strong> linda@example.com / user123</li>
                    </ul>
                  </div>

                  {/* Lien pour retourner au site principal */}
                  <div className="text-center">
                    <Link href="/" className="text-sm text-gray-600 hover:text-pink-600">
                      Retourner au site principal
                    </Link>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}