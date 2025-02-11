import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '@/lib/axios';

interface AdminStats {
  totalUsers: number;
  totalRecipes: number;
  pendingRecipes: number;
  totalComments: number;
}

interface PendingContent {
  recipes: Array<{
    id: string;
    title: string;
    author: string;
    submittedAt: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    author: string;
    recipeTitle: string;
    createdAt: string;
  }>;
}

interface Activity {
  id: string;
  type: 'recipe_created' | 'recipe_updated' | 'comment_added' | 'user_registered';
  title: string;
  date: string;
  user: {
    id: string;
    pseudo: string;
  };
}

interface AdminDashboardData {
  stats: AdminStats;
  pendingContent: PendingContent;
  recentActivities: Activity[];
}

const initialData: AdminDashboardData = {
  stats: {
    totalUsers: 0,
    totalRecipes: 0,
    pendingRecipes: 0,
    totalComments: 0,
  },
  pendingContent: {
    recipes: [],
    comments: []
  },
  recentActivities: []
};

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        setError(null);

        const [statsRes, activitiesRes] = await Promise.all([
          api.get('/api/dashboard/stats/user'),
          api.get('/api/dashboard/interactions/recent')
        ]);

        setData({
          stats: statsRes.data.data,
          pendingContent: {
            recipes: [],
            comments: []
          },
          recentActivities: activitiesRes.data.data
        });
      } catch (err: any) {
        console.error('Erreur lors de la récupération des données admin:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  return { data, isLoading, error };
}
