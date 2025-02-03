import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface LoginCredentials {
  email: string;
  motDePasse: string;
}

interface RegisterData {
  email: string;
  password: string;
  prenom: string;
  nom: string;
  pseudo: string;
}

interface AuthResponse {
  status: number;
  data: {
    token: string;
    user: User;
    message?: string;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      // Simulation d'une requête API
      const response: AuthResponse = {
        status: 200,
        data: {
          token: 'mock-token',
          user: {
            id: 1,
            email: credentials.email,
            role: 'USER'
          }
        }
      };
      setUser(response.data.user);
      return response;
    } catch (err) {
      setError("Erreur lors de la connexion");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      // Simulation d'une requête API
      const response: AuthResponse = {
        status: 200,
        data: {
          token: 'mock-token',
          user: {
            id: 1,
            email: data.email,
            role: 'USER'
          }
        }
      };
      return response;
    } catch (err) {
      setError("Erreur lors de l'inscription");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setUser(null);
      router.push('/connexion');
    } catch (err) {
      setError("Erreur lors de la déconnexion");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      // Simulation de vérification du token
      const token = localStorage.getItem('token');
      if (token) {
        setUser({
          id: 1,
          email: 'user@test.com',
          role: 'USER'
        });
      }
    } catch (err) {
      setError("Erreur lors de la vérification de l'authentification");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 