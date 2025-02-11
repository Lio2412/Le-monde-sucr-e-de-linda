import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials, RegisterData } from '@/types/auth';

const STORAGE_KEY = 'auth_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Charger l'utilisateur depuis le localStorage au montage
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const navigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simuler une connexion réussie avec des données statiques
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: 'Utilisateur Test',
        role: 'user'
      };

      // Sauvegarder dans le localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      navigate('/admin');
    } catch (err) {
      setError('Erreur lors de la connexion');
      console.error('Erreur de connexion:', err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simuler une inscription réussie
      const mockUser: User = {
        id: '1',
        email: data.email,
        name: data.name,
        role: 'user'
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      navigate('/admin');
    } catch (err) {
      setError('Erreur lors de l\'inscription');
      console.error('Erreur d\'inscription:', err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    navigate('/');
  }, [navigate]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
}