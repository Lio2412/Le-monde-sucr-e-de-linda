import { api } from '@/lib/api-client';

/**
 * Interfaces pour le service d'authentification administrateur
 */
export interface AdminCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  image?: string | null;
  isActive: boolean;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface SessionValidationResult {
  valid: boolean;
  user?: User;
  message?: string;
}

export interface LogoutResult {
  success: boolean;
  message?: string;
}

/**
 * Service d'authentification pour les administrateurs
 */
class AdminAuth {
  private readonly BASE_URL = '/api/admin';

  /**
   * Authentifie un administrateur
   * @param credentials Identifiants de connexion
   */
  async login(credentials: AdminCredentials): Promise<AuthResponse> {
    try {
      console.log('Tentative de connexion admin avec:', credentials.email);
      
      // Utilisation de l'API route Next.js (qui fait le relay vers le backend)
      const data = await api.post<AuthResponse>(`${this.BASE_URL}/login`, credentials);
      
      // Sauvegarder le token et les informations utilisateur
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion admin:', error);
      throw error;
    }
  }

  /**
   * Vérifie si la session admin est valide
   */
  async validateSession(): Promise<SessionValidationResult> {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return { valid: false, message: 'Aucun token trouvé' };
      }
      
      // Utilisation de l'API route Next.js
      const data = await api.post<SessionValidationResult>(`${this.BASE_URL}/validate-session`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la validation de session:', error);
      return { valid: false, message: 'Erreur lors de la validation de session' };
    }
  }

  /**
   * Déconnecte l'administrateur
   */
  async logout(): Promise<LogoutResult> {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return { success: true, message: 'Déjà déconnecté' };
      }
      
      // Tentative de déconnexion via l'API
      try {
        await api.post(`${this.BASE_URL}/logout`);
      } catch (err) {
        // On continue même en cas d'erreur
        console.warn('Erreur lors de la déconnexion côté serveur:', err);
      }
      
      // Nettoyer le stockage local
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      return { success: true, message: 'Déconnexion réussie' };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      
      // Même en cas d'erreur, on supprime le token et considère l'utilisateur déconnecté
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      return { success: true, message: 'Déconnexion effectuée malgré une erreur' };
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('adminToken');
    return !!token;
  }

  /**
   * Récupère les informations utilisateur
   */
  getCurrentUser(): User | null {
    try {
      const userString = localStorage.getItem('adminUser');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }
}

// Export d'une instance unique du service d'authentification admin
export const adminAuth = new AdminAuth();