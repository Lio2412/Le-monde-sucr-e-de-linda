import axios from 'axios';

interface AdminCredentials {
  email: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthResponse {
  status: number;
  data: {
    token: string;
    user: User;
    message?: string;
  };
}

interface SessionValidationResult {
  isValid: boolean;
  message?: string;
}

interface LogoutResult {
  success: boolean;
  message?: string;
}

class AdminAuth {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  async login(credentials: AdminCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/admin/login`, credentials);
      return {
        status: response.status,
        data: {
          token: response.data.token,
          user: response.data.user,
          message: response.data.message
        }
      };
    } catch (error) {
      throw new Error('Identifiants invalides');
    }
  }

  async validateSession(token: string): Promise<SessionValidationResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/admin/validate-session`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return {
        isValid: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        isValid: false,
        message: 'Session invalide'
      };
    }
  }

  async logout(): Promise<LogoutResult> {
    try {
      await axios.post(`${this.baseUrl}/api/admin/logout`);
      return {
        success: true,
        message: 'Déconnexion réussie'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la déconnexion'
      };
    }
  }
}

export const adminAuth = new AdminAuth(); 