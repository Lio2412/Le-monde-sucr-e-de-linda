import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
}

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la connexion');
      }
      throw new Error('Erreur réseau');
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de l\'inscription');
      }
      throw new Error('Erreur réseau');
    }
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  },

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la réinitialisation du mot de passe');
      }
      throw new Error('Erreur réseau');
    }
  },

  async updatePassword(token: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/update-password`, {
        token,
        password: newPassword
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la mise à jour du mot de passe');
      }
      throw new Error('Erreur réseau');
    }
  }
};

export default authService;
