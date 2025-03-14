import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Types pour la gestion des erreurs
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// Type pour les réponses d'erreur du serveur
interface ErrorResponse {
  message?: string;
  error?: string;
}

// Configuration de base
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Création de l'instance axios avec une configuration de base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 secondes de timeout
});

// Récupération du token selon le type d'utilisateur (admin ou utilisateur standard)
const getAuthToken = (isAdmin = false): string | null => {
  return isAdmin 
    ? localStorage.getItem('adminToken') || null
    : Cookies.get('auth_token') || null;
};

// Intercepteur pour ajouter le token d'authentification aux requêtes
apiClient.interceptors.request.use(
  (config) => {
    // Détecter si c'est une requête admin basée sur l'URL
    const isAdminRequest = config.url?.includes('/api/admin/');
    
    // Récupérer le token approprié
    const token = getAuthToken(isAdminRequest);
    
    // Si le token existe, l'ajouter aux headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔹 Requête API:', {
        url: config.url,
        method: config.method,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Réponse API:', {
        status: response.status,
        url: response.config.url,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status || 500;
    
    // Récupérer les données d'erreur du serveur
    const errorData = error.response?.data as ErrorResponse | undefined;
    
    // Formater l'erreur de manière cohérente
    const apiError: ApiError = {
      status,
      message: errorData?.message || errorData?.error || error.message || 'Erreur serveur',
      details: error.response?.data,
    };
    
    console.error('❌ Erreur API:', apiError);
    
    // Gestion spécifique selon le code d'erreur
    if (status === 401) {
      // Token expiré ou invalide
      console.warn('🔑 Session expirée ou invalide');
      
      // Si c'est une requête admin (détection par URL), nettoyer le localStorage
      if (error.config?.url?.includes('/api/admin/')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        // Redirection vers la page de connexion admin si on n'y est pas déjà
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/connexion')) {
          console.log('⏱️ Redirection vers la page de connexion dans 2 secondes...');
          setTimeout(() => {
            window.location.href = '/connexion';
          }, 2000);
        }
      }
    }
    
    return Promise.reject(apiError);
  }
);

// Helpers pour les différents types de requêtes
export const api = {
  // Requêtes GET avec gestion d'erreurs et options
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Requêtes POST
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Requêtes PUT
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Requêtes DELETE
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Helper pour construire des URLs avec paramètres de requête
  buildUrl: (baseUrl: string, params?: Record<string, any>): string => {
    if (!params) return baseUrl;
    
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
};

export default apiClient;
