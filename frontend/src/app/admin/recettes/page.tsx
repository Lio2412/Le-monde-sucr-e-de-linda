'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit, Eye, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { adminAuth } from '@/services/admin-auth.service';

interface Recipe {
  id: string;
  titre: string;
  categorie: string;
  statut: string;
  date_creation: string;
  vues: number;
}

export default function RecettesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('tous');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Vérification de l'authentification et chargement des recettes
  useEffect(() => {
    const checkAuthAndLoadRecipes = async () => {
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
        
        // Charger les recettes
        await loadRecipes();
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'accès admin:', err);
        setError('Problème lors de la vérification de vos droits d\'accès');
        setTimeout(() => {
          router.push('/connexion');
        }, 2000);
      }
    };

    checkAuthAndLoadRecipes();
  }, [router]);

  // Fonction pour charger les recettes
  const loadRecipes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getRecipes();
      setRecipes(response.recipes || []); // Extraire le tableau de recettes de la réponse
    } catch (err: any) {
      console.error('Erreur lors du chargement des recettes:', err);
      setError(err.message || 'Impossible de charger les recettes');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour supprimer une recette
  const deleteRecipe = async (recipeId: string) => {
    setIsDeleting(recipeId);
    setDeleteError(null);
    setDeleteSuccess(null);
    
    try {
      await adminService.deleteRecipe(recipeId);
      setDeleteSuccess(`La recette a été supprimée avec succès`);
      // Recharger les recettes après suppression
      await loadRecipes();
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la recette:', err);
      setDeleteError(err.message || 'Impossible de supprimer la recette');
      // Effacer le message d'erreur après 3 secondes
      setTimeout(() => {
        setDeleteError(null);
      }, 3000);
    } finally {
      setIsDeleting(null);
    }
  };

  // Filtrer les recettes en fonction de la recherche et du statut
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.titre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'tous' || recipe.statut === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Afficher le message d'erreur si l'authentification a échoué
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
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
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Recettes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos recettes, créez de nouveaux contenus et organisez vos catégories
          </p>
        </div>
        <Link
          href="/admin/recettes/nouvelle"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Recette
        </Link>
      </div>

      {/* Filtres et Recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une recette..."
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="tous">Tous les statuts</option>
            <option value="publié">Publié</option>
            <option value="brouillon">Brouillon</option>
          </select>
        </div>
      </div>

      {/* Messages de feedback */}
      {deleteSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{deleteSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{deleteError}</p>
            </div>
          </div>
        </div>
      )}

      {/* État de chargement */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
          <span className="ml-2 text-gray-600">Chargement des recettes...</span>
        </div>
      )}

      {/* Liste des Recettes */}
      {!isLoading && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Aucune recette ne correspond à vos critères de recherche</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecipes.map((recipe) => (
                  <tr key={recipe.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {recipe.titre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{recipe.categorie}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        recipe.statut === 'publié' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {recipe.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recipe.date_creation ? formatDate(recipe.date_creation) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recipe.vues || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          href={`/recettes/${recipe.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir la recette"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/admin/recettes/${recipe.id}`}
                          className="text-pink-600 hover:text-pink-900"
                          title="Modifier la recette"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm(`Êtes-vous sûr de vouloir supprimer la recette "${recipe.titre}" ?`)) {
                              deleteRecipe(recipe.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer la recette"
                          disabled={isDeleting === recipe.id}
                        >
                          {isDeleting === recipe.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}