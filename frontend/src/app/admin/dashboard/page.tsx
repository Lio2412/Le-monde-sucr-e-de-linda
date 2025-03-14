'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth } from '@/services/admin-auth.service';
import { adminService } from '@/services/admin.service';
import { LogOut, ChefHat, Users, MessageSquare, TrendingUp, Clock } from 'lucide-react';

// Interface pour les statistiques du tableau de bord
interface DashboardStats {
  generalStats: {
    totalRecipes: number;
    totalUsers: number;
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

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fonction pour charger les statistiques du tableau de bord
  const loadDashboardStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setStatsError(err.message || 'Impossible de charger les statistiques');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Récupérer le token admin du localStorage
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          console.error('Aucun token admin trouvé');
          setError('Vous devez être connecté en tant qu\'administrateur');
          setTimeout(() => {
            router.push('/connexion');
          }, 2000);
          return;
        }
        
        // Valider la session admin
        const sessionResult = await adminAuth.validateSession();
        
        if (!sessionResult.valid) {
          console.error('Session admin invalide:', sessionResult.message);
          setError('Votre session a expiré, veuillez vous reconnecter');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setTimeout(() => {
            router.push('/connexion');
          }, 2000);
          return;
        }
        
        // Récupérer les informations de l'utilisateur admin
        const adminUserData = localStorage.getItem('adminUser');
        if (adminUserData) {
          setAdminUser(JSON.parse(adminUserData));
        }
        
        setIsLoading(false);
        
        // Charger les statistiques du tableau de bord
        loadDashboardStats();
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'accès admin:', err);
        setError('Problème lors de la vérification de vos droits d\'accès');
        setTimeout(() => {
          router.push('/connexion');
        }, 2000);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-center mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-center mb-2">Accès refusé</h2>
          <p className="text-gray-600 text-center">{error}</p>
          <p className="text-gray-500 text-center text-sm mt-4">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  // Formater la date en format lisible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Connecté en tant que : {adminUser?.email || 'admin@example.com'}
              </p>
              <button 
                onClick={async () => {
                  try {
                    await adminAuth.logout();
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    router.push('/connexion');
                  } catch (err) {
                    console.error('Erreur lors de la déconnexion:', err);
                    // Rediriger quand même vers la page de connexion
                    router.push('/connexion');
                  }
                }}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                aria-label="Se déconnecter"
              >
                <LogOut size={16} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Statistiques générales */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChefHat className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Recettes
                      </dt>
                      <dd>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {stats?.generalStats.totalRecipes || 0}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Utilisateurs
                      </dt>
                      <dd>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {stats?.generalStats.totalUsers || 0}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Commentaires
                      </dt>
                      <dd>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {stats?.generalStats.totalComments || 0}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Taux d'engagement
                      </dt>
                      <dd>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {stats?.generalStats.totalComments && stats?.generalStats.totalRecipes
                              ? `${(stats.generalStats.totalComments / stats.generalStats.totalRecipes).toFixed(1)}`
                              : '0'} 
                              <span className="text-sm font-normal">com./recette</span>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Affichage de l'erreur lors du chargement des statistiques */}
          {statsError && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {statsError}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => loadDashboardStats()}
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <span className="sr-only">Réessayer</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenu principal */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recettes populaires */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-pink-50">
                <h3 className="text-lg font-medium leading-6 text-pink-800">
                  Recettes populaires
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-pink-600">
                  Les recettes les plus consultées
                </p>
              </div>
              <div className="px-4 py-3 sm:px-6">
                {statsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="ml-4 space-y-2 flex-1">
                          <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : stats?.recipes.popularRecipes && stats.recipes.popularRecipes.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {stats.recipes.popularRecipes.map((recipe, index) => (
                      <li key={recipe.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="bg-pink-100 text-pink-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {recipe.titre}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <TrendingUp className="h-4 w-4 mr-1 text-pink-500" />
                          <span>{recipe.vues || 0} vues</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Aucune donnée disponible
                  </p>
                )}
              </div>
            </div>

            {/* Utilisateurs actifs */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-blue-50">
                <h3 className="text-lg font-medium leading-6 text-blue-800">
                  Utilisateurs actifs
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-blue-600">
                  Les utilisateurs avec le plus d'activité
                </p>
              </div>
              <div className="px-4 py-3 sm:px-6">
                {statsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="ml-4 space-y-2 flex-1">
                          <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : stats?.users.activeUsers && stats.users.activeUsers.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {stats.users.activeUsers.map((user, index) => (
                      <li key={user.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {user.full_name || 'Utilisateur'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />
                          <span>{user.commentaires_count || 0} commentaires</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Aucune donnée disponible
                  </p>
                )}
              </div>
            </div>

            {/* Derniers commentaires */}
            <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-2">
              <div className="px-4 py-5 sm:px-6 bg-green-50">
                <h3 className="text-lg font-medium leading-6 text-green-800">
                  Commentaires récents
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-green-600">
                  Les derniers commentaires postés
                </p>
              </div>
              <div className="px-4 py-3 sm:px-6">
                {statsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse"></div>
                          <div className="ml-2 h-4 w-40 bg-gray-200 animate-pulse rounded"></div>
                          <div className="ml-auto h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : stats?.comments.recentComments && stats.comments.recentComments.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {stats.comments.recentComments.map((comment) => (
                      <li key={comment.id} className="py-4">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.date_creation)}
                            </span>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Recette #{comment.recette_id.substr(0, 6)}...
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {comment.contenu}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Aucun commentaire récent
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pied de page avec mise à jour */}
          {stats?.lastUpdated && (
            <div className="mt-6 text-center text-xs text-gray-500">
              Dernière mise à jour : {formatDate(stats.lastUpdated)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
