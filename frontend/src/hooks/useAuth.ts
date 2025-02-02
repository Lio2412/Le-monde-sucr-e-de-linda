import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { User } from '@/types/user';
import { Role } from '@/types/role';

interface AuthResponse {
  success: boolean;
  data?: {
    user?: User;
    token?: string;
    message?: string;
  };
  message?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const token = localStorage.getItem('token') || '';
          const response = await authService.getMe(token);
          if (response.data?.user) {
            setUser(response.data.user);
            // Redirection en fonction du rôle
            if (response.data.user.roles.some((r: Role) => r.role.nom.toLowerCase() === 'admin')) {
              router.replace('/admin');
            } else {
              router.replace('/dashboard');
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        if (error instanceof Error) {
          if (error.message.includes('expired') || error.message.includes('Token expiré')) {
            setError('Session expirée');
            localStorage.removeItem('token');
            setUser(null);
            router.replace('/connexion');
          } else if (error.message.includes('invalid')) {
            setError('Session invalide');
            localStorage.removeItem('token');
            setUser(null);
            router.replace('/connexion');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const login = async (credentials: { email: string; password: string }) => {
    setError(null);
    try {
      const response = await authService.login(credentials) as AuthResponse;

      if (response.success && response.data) {
        const { user, token } = response.data;
        if (user && token) {
          setUser(user);
          localStorage.setItem('token', token);
          router.push('/dashboard');
          return { success: true };
        }
      }
      
      const errorMsg = response.message || 'Email ou mot de passe incorrect';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      let errorMsg = 'Problème de connexion';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMsg = 'Délai d\'attente dépassé';
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMsg = 'Problème de connexion';
        } else if (error.message.includes('incorrect')) {
          errorMsg = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('expired') || error.message.includes('Token expiré')) {
          errorMsg = 'Session expirée';
          router.push('/connexion');
        } else if (error.message.includes('invalid') || error.message.includes('Invalid token')) {
          errorMsg = 'Session invalide';
          router.push('/connexion');
        } else if (error.message === 'SQL' || error.message.includes('SQL')) {
          errorMsg = 'Caractères non autorisés';
        }
      }
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('token');
      router.replace('/connexion');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      if (error instanceof Error) {
        if (error.message.includes('expired') || error.message.includes('Token expiré')) {
          setError('Session expirée');
          router.replace('/connexion');
        } else if (error.message.includes('invalid')) {
          setError('Session invalide');
          router.replace('/connexion');
        }
      }
    }
  };

  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some((r: Role) => r.role.nom === roleName);
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
      const response = await authService.register(registrationData) as AuthResponse;
      
      if (response.success && response.data) {
        if (response.data.message === 'Email de validation envoyé') {
          return { success: true, message: 'Email de validation envoyé' };
        }
        
        const { user, token } = response.data;
        if (user && token) {
          setUser(user);
          localStorage.setItem('token', token);
          return { success: true, data: { user, token } };
        }
      }
      
      const errorMsg = response.message || "Une erreur est survenue lors de l'inscription";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      let errorMsg = "Une erreur est survenue lors de l'inscription";
      
      if (error instanceof Error) {
        if (error.message.includes('email') && error.message.includes('existe')) {
          errorMsg = 'Cet email est déjà utilisé';
        } else if (error.message.includes('mot de passe') || error.message.includes('password')) {
          errorMsg = 'Le mot de passe ne respecte pas les critères de sécurité';
        } else if (error.message.includes('SQL')) {
          errorMsg = 'Caractères non autorisés';
        } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMsg = 'Délai d\'attente dépassé';
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMsg = 'Erreur réseau';
        }
      }
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('invalid');
      
      const response = await authService.getMe(token);
      if (response.data?.user) {
        setUser(response.data.user);
        return { success: true, data: { user: response.data.user } };
      }
      throw new Error('invalid');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired') || error.message.includes('Token expiré')) {
          setError('Session expirée');
          localStorage.removeItem('token');
          setUser(null);
          throw new Error('expired');
        } else if (error.message.includes('invalid')) {
          setError('Session invalide');
          localStorage.removeItem('token');
          setUser(null);
          throw new Error('invalid');
        }
      }
      throw error;
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
    getCurrentUser,
  };
}; 