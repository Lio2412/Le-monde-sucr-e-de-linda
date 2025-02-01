import axios from 'axios';

// L'URL de base ne doit pas inclure /auth car il est déjà dans l'API_PREFIX
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  nom: string;
  prenom: string;
  pseudo: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: {
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
    };
    token: string;
  };
  message?: string;
}

class AuthService {
  /**
   * Connexion d'un utilisateur
   */
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      console.log('Tentative de connexion à:', `${API_URL}/auth/login`);
      const { email, password } = credentials;
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      }, {
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
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: {
          user: response.data.data,
          token
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || 'Erreur lors de la récupération du profil');
      }
      throw error;
    }
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
    return !!localStorage.getItem('token');
  }
}

const authService = new AuthService();
export default authService; 