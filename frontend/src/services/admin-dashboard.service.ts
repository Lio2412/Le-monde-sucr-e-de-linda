import api from '@/lib/axios';

export interface DashboardStats {
  users: number;
  recipes: number;
  articles: number;
  comments: number;
  views: number;
  favorites: number;
  engagement: number;
}

class AdminDashboardService {
  async getDashboardStats(): Promise<{ data: DashboardStats }> {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

export const adminDashboardService = new AdminDashboardService(); 