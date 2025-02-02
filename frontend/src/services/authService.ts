import axios from 'axios';
import type { LoginData, RegisterData, AuthResponse, AuthService } from '@/types/auth';

// L'URL de base ne doit pas inclure /auth car il est déjà dans l'API_PREFIX
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class AuthServiceImpl implements AuthService {
  /**
   * Connexion d'un utilisateur
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('Tentative de connexion à:', `${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Réponse du serveur:', response.data);

      // Stocker le token si présent
      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur détaillée:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        
        // Gestion des erreurs spécifiques
        if (errorMessage.includes('expired') || errorMessage.toLowerCase().includes('token expiré')) {
          throw new Error('expired');
        } else if (errorMessage.includes('invalid') || errorMessage.toLowerCase().includes('token invalide')) {
          throw new Error('invalid');
        } else if (errorMessage.includes('incorrect') || errorMessage.toLowerCase().includes('mot de passe incorrect')) {
          throw new Error('incorrect');
        } else if (error.code === 'ECONNABORTED' || errorMessage.includes('timeout')) {
          throw new Error('Timeout');
        } else if (error.message === 'Network Error' || !error.response) {
          throw new Error('Network Error');
        } else if (errorMessage.includes('SQL') || errorMessage.includes('injection')) {
          throw new Error('SQL');
        }
        
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Stocker le token dans le localStorage
      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        
        // Gestion des erreurs spécifiques pour l'inscription
        if (errorMessage.includes('email') && errorMessage.includes('existe')) {
          throw new Error('email_exists');
        } else if (errorMessage.includes('mot de passe') || errorMessage.includes('password')) {
          throw new Error('invalid_password');
        } else if (errorMessage.includes('SQL') || errorMessage.includes('injection')) {
          throw new Error('SQL');
        }
        
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Récupération des informations de l'utilisateur connecté
   */
  async getMe(token: string): Promise<AuthResponse> {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        
        if (errorMessage.includes('expired') || errorMessage.toLowerCase().includes('token expiré')) {
          throw new Error('expired');
        } else if (errorMessage.includes('invalid') || errorMessage.toLowerCase().includes('token invalide')) {
          throw new Error('invalid');
        }
        
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Récupération des informations de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<AuthResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Non authentifié');
    }
    return this.getMe(token);
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    localStorage.removeItem('token');
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}

export const authService = {
  login: new AuthServiceImpl().login,
  logout: new AuthServiceImpl().logout,
  register: new AuthServiceImpl().register,
  getMe: new AuthServiceImpl().getMe,
  isAuthenticated: new AuthServiceImpl().isAuthenticated,
  getCurrentUser: new AuthServiceImpl().getCurrentUser.bind(new AuthServiceImpl()),
}; 