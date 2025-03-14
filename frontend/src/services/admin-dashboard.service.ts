import { api } from '@/lib/api-client';
import { DashboardStats } from './admin.service';

/**
 * Service pour le tableau de bord administrateur
 */
class AdminDashboardService {
  private readonly BASE_URL = '/api/admin';

  /**
   * Récupère les statistiques du tableau de bord administrateur
   * @returns Les statistiques complètes du tableau de bord
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await api.get<DashboardStats>(`${this.BASE_URL}/dashboard`);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du tableau de bord:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'activité récente
   * @returns Les données d'activité récente
   */
  async getRecentActivity() {
    try {
      return await api.get(`${this.BASE_URL}/activity`);
    } catch (error) {
      console.error('Erreur lors de la récupération des activités récentes:', error);
      throw error;
    }
  }
}

export const adminDashboardService = new AdminDashboardService(); 