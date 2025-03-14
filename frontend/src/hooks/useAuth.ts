import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials, RegisterData } from '@/types/auth';
import apiClient from '@/lib/api-client';
import Cookies from 'js-cookie';

const STORAGE_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';

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
        Cookies.remove(TOKEN_KEY);
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
      
      console.log('Tentative de connexion avec:', credentials);
      
      // SOLUTION TEMPORAIRE : Simuler une connexion réussie
      if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
        console.log('Connexion admin simulée réussie');
        
        const mockUser = {
          id: '1',
          email: 'admin@example.com',
          nom: 'Admin',
          prenom: '',
          pseudo: 'admin',
          role: 'ADMIN',
          roles: [{ role: { nom: 'ADMIN', description: 'Administrateur' } }]
        } as User;
        
        // Sauvegarder dans le localStorage et cookie
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        Cookies.set(TOKEN_KEY, 'mock-token-admin', { path: '/', sameSite: 'strict' });
        
        setUser(mockUser);
        console.log('Redirection vers le dashboard admin...');
        navigate('/admin/dashboard');
        return true;
      }
      
      if (credentials.email === 'linda@example.com' && credentials.password === 'user123') {
        console.log('Connexion utilisateur simulée réussie');
        
        const mockUser = {
          id: '2',
          email: 'linda@example.com',
          nom: 'Linda',
          prenom: '',
          pseudo: 'linda',
          role: 'USER',
          roles: [{ role: { nom: 'USER', description: 'Utilisateur' } }]
        } as User;
        
        // Sauvegarder dans le localStorage et cookie
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        Cookies.set(TOKEN_KEY, 'mock-token-user', { path: '/', sameSite: 'strict' });
        
        setUser(mockUser);
        navigate('/dashboard');
        return true;
      }
      
      // Si les identifiants ne correspondent pas, essayer l'API
      const apiUrl = '/api/auth/login';
      console.log('URL de l\'API:', apiUrl);
      
      try {
        // Appeler l'API d'authentification
        const response = await apiClient.post(apiUrl, {
          email: credentials.email,
          password: credentials.password // Convertir motDePasse en password pour l'API
        });
        
        console.log('Réponse de l\'API:', response.data);
        
        if (response.data && response.data.user && response.data.token) {
          const userData = response.data.user;
          
          // Sauvegarder dans le localStorage et cookie
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
          Cookies.set(TOKEN_KEY, response.data.token, { path: '/', sameSite: 'strict' });
          
          setUser(userData);
          
          // Rediriger en fonction du rôle
          if (userData.role === 'ADMIN') {
            navigate('/admin/dashboard');
            return true;
          } else {
            navigate('/dashboard');
            return true;
          }
        } else {
          setError('Réponse invalide du serveur');
          return false;
        }
      } catch (apiError) {
        console.error('Erreur API:', apiError);
        setError('Email ou mot de passe incorrect');
        return false;
      }
    } catch (err: any) {
      console.error('Erreur de connexion détaillée:', err);
      console.error('URL qui a échoué:', '/api/auth/login');
      console.error('Données envoyées:', {
        email: credentials.email,
        password: '******' // Masqué pour la sécurité
      });
      
      setError(err.response?.data?.error || 'Erreur lors de la connexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Appeler l'API d'inscription
      const response = await apiClient.post('/api/auth/register', data);
      
      if (response.data && response.data.user && response.data.token) {
        const userData = response.data.user;
        
        // Sauvegarder dans le localStorage et cookie
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        Cookies.set(TOKEN_KEY, response.data.token, { path: '/', sameSite: 'strict' });
        
        setUser(userData);
        
        // Rediriger en fonction du rôle
        if (userData.role === 'ADMIN') {
          navigate('/admin/dashboard');
          return true;
        } else {
          navigate('/dashboard');
          return true;
        }
      } else {
        setError('Réponse invalide du serveur');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
      console.error('Erreur d\'inscription:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    Cookies.remove(TOKEN_KEY);
    setUser(null);
    navigate('/');
  }, [navigate]);

  const getCurrentUser = useCallback(async () => {
    try {
      const token = Cookies.get(TOKEN_KEY);
      
      if (!token) {
        return { success: false, data: null };
      }
      
      // Appeler l'API pour vérifier le token
      const apiUrl = '/api/auth/me';
      
      try {
        const response = await apiClient.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.user) {
          setUser(response.data.user);
          return { success: true, data: response.data };
        }
        
        return { success: false, data: null };
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        return { success: false, data: null };
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      return { success: false, data: null };
    }
  }, []);

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useCallback((roleName: string) => {
    if (!user) return false;
    
    // Vérifier si l'utilisateur a un champ role qui correspond directement
    if (user.role === roleName) return true;
    
    // Vérifier dans le tableau des rôles si disponible
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some(userRole => 
        userRole.role && userRole.role.nom === roleName
      );
    }
    
    return false;
  }, [user]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    hasRole,
    isAuthenticated: !!user
  };
}