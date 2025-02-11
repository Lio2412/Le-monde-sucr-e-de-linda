import { useState } from 'react';
import { recettesService, Recette } from '@/services/recettes.service';
import { useToast } from '@/components/ui/use-toast';

interface UseRecettesParams {
  page?: number;
  limit?: number;
  search?: string;
  statut?: string;
}

export function useRecettes(initialParams?: UseRecettesParams) {
  const [recettes, setRecettes] = useState<Recette[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 10,
  });

  const { toast } = useToast();

  const fetchRecettes = async (params?: UseRecettesParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await recettesService.getAll(params);
      setRecettes(response.recettes);
      setPagination(response.pagination);
    } catch (err) {
      setError('Erreur lors de la récupération des recettes');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les recettes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createRecette = async (data: Recette) => {
    try {
      setLoading(true);
      const newRecette = await recettesService.create(data);
      setRecettes(prev => [newRecette, ...prev]);
      toast({
        title: 'Succès',
        description: 'La recette a été créée avec succès',
      });
      return newRecette;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la recette',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRecette = async (id: string, data: Partial<Recette>) => {
    try {
      setLoading(true);
      const updatedRecette = await recettesService.update(id, data);
      setRecettes(prev =>
        prev.map(recette =>
          recette.id === id ? updatedRecette : recette
        )
      );
      toast({
        title: 'Succès',
        description: 'La recette a été mise à jour avec succès',
      });
      return updatedRecette;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la recette',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecette = async (id: string) => {
    try {
      setLoading(true);
      await recettesService.delete(id);
      setRecettes(prev => prev.filter(recette => recette.id !== id));
      toast({
        title: 'Succès',
        description: 'La recette a été supprimée avec succès',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la recette',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, statut: 'brouillon' | 'publié') => {
    try {
      setLoading(true);
      const updatedRecette = await recettesService.updateStatus(id, statut);
      setRecettes(prev =>
        prev.map(recette =>
          recette.id === id ? updatedRecette : recette
        )
      );
      toast({
        title: 'Succès',
        description: `La recette est maintenant ${statut === 'publié' ? 'publiée' : 'en brouillon'}`,
      });
      return updatedRecette;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut de la recette',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    recettes,
    loading,
    error,
    pagination,
    fetchRecettes,
    createRecette,
    updateRecette,
    deleteRecette,
    updateStatus,
  };
} 