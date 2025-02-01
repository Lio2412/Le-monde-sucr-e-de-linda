import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  pseudo: string;
  roles: Array<{
    role: {
      nom: string;
      description: string;
    }
  }>;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          if (response.data?.user) {
            setUser(response.data.user);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      console.log('Réponse complète:', response);

      if (response.data?.user) {
        setUser(response.data.user);
        
        // Déterminer la redirection en fonction du rôle
        const userRoles = response.data.user.roles.map((r: { role: { nom: string } }) => r.role.nom);
        console.log('Rôles de l\'utilisateur:', userRoles);
        
        let redirectPath = '/dashboard';
        if (userRoles.includes('admin')) {
          redirectPath = '/admin';
        } else if (userRoles.includes('patissier')) {
          redirectPath = '/patissier';
        }
        
        return { 
          success: true,
          redirectPath
        };
      }

      return { 
        success: false, 
        message: response.message || 'Erreur lors de la connexion' 
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors de la connexion' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/connexion');
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.some(userRole => userRole.role.nom === role) ?? false;
  };

  return {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user
  };
}; 