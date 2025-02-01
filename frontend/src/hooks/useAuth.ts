import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { User } from '@/types/user';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          if (response.data?.user) {
            setUser(response.data.user);
            // Redirection en fonction du rôle
            if (response.data.user.roles.some(r => r.role.nom === 'admin')) {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const login = async (credentials: { email: string; password: string }) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      console.log('Réponse complète:', response);

      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        localStorage.setItem('token', token);

        // Log des rôles pour le débogage
        console.log('Rôles de l\'utilisateur:', user.roles);

        // Redirection en fonction du rôle
        if (user.roles.some(r => r.role.nom === 'admin')) {
          router.push('/admin');
          return { success: true, redirectPath: '/admin' };
        } else {
          router.push('/dashboard');
          return { success: true, redirectPath: '/dashboard' };
        }
      } else {
        setError(response.message || 'Une erreur est survenue lors de la connexion');
        return { success: false, message: response.message || 'Une erreur est survenue lors de la connexion' };
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Email ou mot de passe incorrect');
      return { success: false, message: 'Email ou mot de passe incorrect' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/connexion');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some((r: { role: { nom: string } }) => r.role.nom === roleName);
  };

  const isAuthenticated = (): boolean => {
    return authService.isAuthenticated();
  };

  const register = async (registrationData: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    pseudo: string;
  }) => {
    setError(null);
    try {
      const response = await authService.register(registrationData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        localStorage.setItem('token', token);
        
        return { success: true, data: { user, token } };
      } else {
        setError(response.message || "Une erreur est survenue lors de l'inscription");
        return { 
          success: false, 
          message: response.message || "Une erreur est survenue lors de l'inscription" 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  return {
    user,
    setUser,
    loading,
    error,
    login,
    logout,
    hasRole,
    isAuthenticated,
    register,
  };
}; 