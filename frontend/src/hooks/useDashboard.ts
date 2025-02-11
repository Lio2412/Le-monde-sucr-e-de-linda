import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '@/lib/axios';

interface DashboardStats {
  favorisCount: number;
  commentairesCount: number;
  partagesCount: number;
}

interface Activity {
  id: string;
  type: 'commentaire' | 'like' | 'partage';
  title: string;
  date: string;
}

interface DashboardData {
  stats: DashboardStats;
  interactions: Activity[];
  profile: {
    hasCompletedProfile: boolean;
  };
}

const initialData: DashboardData = {
  stats: {
    favorisCount: 0,
    commentairesCount: 0,
    partagesCount: 0,
  },
  interactions: [],
  profile: {
    hasCompletedProfile: false,
  },
};

export function useDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>(initialData);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const [statsResponse, interactionsResponse] = await Promise.all([
          api.get<DashboardStats>('/dashboard/stats/user'),
          api.get<Activity[]>('/dashboard/interactions/recent')
        ]);

        setData({
          stats: statsResponse.data,
          interactions: interactionsResponse.data || [],
          profile: {
            hasCompletedProfile: Boolean(
              user.nom &&
              user.prenom &&
              user.email &&
              user.pseudo
            ),
          },
        });
      } catch (err) {
        console.error('Erreur lors de la récupération des données du dashboard:', err);
        setError(
          'Une erreur est survenue lors du chargement des données du tableau de bord'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return { data, isLoading, error };
}