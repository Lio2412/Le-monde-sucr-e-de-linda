'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { playfair } from '@/app/fonts';
import { useAuth } from '@/hooks/useAuth';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, getCurrentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success && response.data?.user) {
          router.push('/dashboard');
        }
      } catch (error) {
        // Ignorer les erreurs d'authentification
      }
    };
    checkAuth();
  }, [getCurrentUser, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isBlocked) {
      setError('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
      setLoading(false);
      return;
    }

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      if (result) {
        router.push('/dashboard');
      } else {
        setLoginAttempts(prev => prev + 1);
        if (loginAttempts >= 2) {
          setIsBlocked(true);
          setError('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
        } else {
          setError('Email ou mot de passe incorrect');
        }
      }
    } catch (err) {
      setError('Problème de connexion');
      setLoginAttempts(prev => prev + 1);
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

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Image décorative */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative w-full lg:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=1200"
                alt="Pâtisseries"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-transparent"></div>
            </motion.div>

            {/* Formulaire de connexion */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-1/2 max-w-md"
            >
              <div className="text-center lg:text-left mb-8">
                <h1 className={`text-3xl font-bold mb-4 ${playfair.className}`}>
                  Connexion
                </h1>
                <p className="text-gray-600">
                  Connectez-vous pour accéder à votre espace personnel et gérer vos recettes favorites.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg" data-testid="error-message">
                  {error}
                </div>
              )}

              <form 
                className="space-y-6"
                role="form"
                onSubmit={handleSubmit}
              >
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      placeholder="exemple@email.com"
                      disabled={loading}
                      data-testid="email"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-12 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                      placeholder="••••••••"
                      disabled={loading}
                      data-testid="password"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                      aria-label="Afficher/Masquer le mot de passe"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                      Se souvenir de moi
                    </label>
                  </div>
                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-sm font-medium text-pink-500 hover:text-pink-600"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Bouton de connexion */}
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="submit"
                  className={`w-full py-3 bg-pink-400 text-white rounded-lg transition-colors ${
                    loading || isBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-500'
                  }`}
                  disabled={loading || isBlocked}
                  data-testid="submit"
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </motion.button>

                {/* Lien d'inscription */}
                <p className="text-center text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link
                    href="/inscription"
                    className="font-medium text-pink-500 hover:text-pink-600"
                  >
                    S'inscrire
                  </Link>
                </p>
              </form>

              {/* Séparateur */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              {/* Boutons sociaux */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  <Image
                    src="/images/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button 
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  <Image
                    src="/images/facebook.svg"
                    alt="Facebook"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
} 