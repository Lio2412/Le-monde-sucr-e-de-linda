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
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || 'Erreur lors de la connexion');
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
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || 'Erreur lors de l\'inscription');
      }
      throw error;
    }
  }

  /**
   * Récupération des informations de l'utilisateur connecté
   */
  async getMe(token: string): Promise<AuthResponse> {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
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

export const authService = new AuthServiceImpl(); 