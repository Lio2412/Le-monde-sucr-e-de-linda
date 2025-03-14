/**
 * Service d'administration
 * Gestion des interactions avec les API administratives
 */

import { api } from '@/lib/api-client';

/**
 * Types des données manipulées par le service admin
 */
export interface DashboardStats {
  generalStats: {
    totalUsers: number;
    totalRecipes: number;
    totalComments: number;
  };
  recipes: {
    recentRecipes: any[];
    popularRecipes: any[];
  };
  users: {
    recentUsers: any[];
    activeUsers: any[];
  };
  comments: {
    recentComments: any[];
    pendingComments: any[];
  };
  lastUpdated: string;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  categoryId?: string;
  role?: string;
}

/**
 * Service pour les fonctionnalités d'administration
 */
class AdminService {
  private readonly BASE_URL = '/api/admin';

  /**
   * Récupère les statistiques du tableau de bord
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await api.get<DashboardStats>(`${this.BASE_URL}/dashboard`);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
  
  /**
   * Récupère la liste des recettes avec pagination et filtres
   */
  async getRecipes(options: PaginationOptions = {}) {
    try {
      const url = api.buildUrl(`${this.BASE_URL}/recipes`, options);
      return await api.get(url);
    } catch (error) {
      console.error('Erreur lors de la récupération des recettes:', error);
      throw error;
    }
  }
  
  /**
   * Crée une nouvelle recette
   */
  async createRecipe(recipeData: any) {
    try {
      return await api.post(`${this.BASE_URL}/recipes`, recipeData);
    } catch (error) {
      console.error('Erreur lors de la création de la recette:', error);
      throw error;
    }
  }
  
  /**
   * Met à jour une recette existante
   */
  async updateRecipe(recipeData: any) {
    try {
      return await api.put(`${this.BASE_URL}/recipes`, recipeData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la recette:', error);
      throw error;
    }
  }
  
  /**
   * Supprime une recette
   */
  async deleteRecipe(recipeId: string) {
    try {
      return await api.delete(`${this.BASE_URL}/recipes/${recipeId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la recette:', error);
      throw error;
    }
  }
  
  /**
   * Récupère la liste des utilisateurs avec pagination et filtres
   */
  async getUsers(options: PaginationOptions = {}) {
    try {
      const url = api.buildUrl(`${this.BASE_URL}/users`, options);
      return await api.get(url);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Récupère un utilisateur par son ID
   */
  async getUserById(userId: string) {
    try {
      return await api.get(`${this.BASE_URL}/users/${userId}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(userData: any) {
    try {
      return await api.post(`${this.BASE_URL}/users`, userData);
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }
  
  /**
   * Met à jour un utilisateur
   */
  async updateUser(userId: string, userData: any) {
    try {
      return await api.put(`${this.BASE_URL}/users/${userId}`, userData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }
  
  /**
   * Réinitialise le mot de passe d'un utilisateur
   */
  async resetUserPassword(userId: string) {
    try {
      return await api.post(`${this.BASE_URL}/users/reset-password`, { userId });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
  }
  
  /**
   * Supprime ou désactive un utilisateur
   */
  async deleteUser(userId: string) {
    try {
      return await api.delete(`${this.BASE_URL}/users/${userId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }
}

// Exportation du service comme singleton
export const adminService = new AdminService();
