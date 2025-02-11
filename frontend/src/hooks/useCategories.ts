import { useState } from 'react';
import { categoriesService, Categorie } from '@/services/categories.service';
import { useToast } from '@/components/ui/use-toast';

interface UseCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
}

interface CategorieArbre extends Categorie {
  enfants: CategorieArbre[];
}

export function useCategories(initialParams?: UseCategoriesParams) {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [arborescence, setArborescence] = useState<CategorieArbre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 20,
  });

  const { toast } = useToast();

  const fetchCategories = async (params?: UseCategoriesParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesService.getAll(params);
      setCategories(response.categories);
      setPagination(response.pagination);
    } catch (err) {
      setError('Erreur lors de la récupération des catégories');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les catégories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchArborescence = async () => {
    try {
      setLoading(true);
      const arborescence = await categoriesService.getArborescence();
      setArborescence(arborescence);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'arborescence des catégories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategorie = async (data: Omit<Categorie, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const nouvelleCategorie = await categoriesService.create(data);
      setCategories(prev => [nouvelleCategorie, ...prev]);
      toast({
        title: 'Succès',
        description: 'La catégorie a été créée avec succès',
      });
      return nouvelleCategorie;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la catégorie',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategorie = async (id: string, data: Partial<Categorie>) => {
    try {
      setLoading(true);
      const categorieMiseAJour = await categoriesService.update(id, data);
      setCategories(prev =>
        prev.map(cat =>
          cat.id === id ? categorieMiseAJour : cat
        )
      );
      toast({
        title: 'Succès',
        description: 'La catégorie a été mise à jour avec succès',
      });
      return categorieMiseAJour;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la catégorie',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategorie = async (id: string) => {
    try {
      setLoading(true);
      await categoriesService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: 'Succès',
        description: 'La catégorie a été supprimée avec succès',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la catégorie',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reordonnerCategories = async (categories: { id: string; ordre: number }[]) => {
    try {
      setLoading(true);
      const categoriesMisesAJour = await categoriesService.reordonner(categories);
      setCategories(prev => {
        const newCategories = [...prev];
        categoriesMisesAJour.forEach(catMaj => {
          const index = newCategories.findIndex(cat => cat.id === catMaj.id);
          if (index !== -1) {
            newCategories[index] = catMaj;
          }
        });
        return newCategories;
      });
      toast({
        title: 'Succès',
        description: 'L\'ordre des catégories a été mis à jour avec succès',
      });
      return categoriesMisesAJour;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de réorganiser les catégories',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    arborescence,
    loading,
    error,
    pagination,
    fetchCategories,
    fetchArborescence,
    createCategorie,
    updateCategorie,
    deleteCategorie,
    reordonnerCategories,
  };
} 