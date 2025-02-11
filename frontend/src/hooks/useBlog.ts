import { useState } from 'react';
import { blogService, Article } from '@/services/blog.service';
import { useToast } from '@/components/ui/use-toast';

interface UseBlogParams {
  page?: number;
  limit?: number;
  search?: string;
  statut?: string;
  categorie?: string;
}

export function useBlog(initialParams?: UseBlogParams) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 10,
  });

  const { toast } = useToast();

  const fetchArticles = async (params?: UseBlogParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogService.getAll(params);
      setArticles(response.articles);
      setPagination(response.pagination);
    } catch (err) {
      setError('Erreur lors de la récupération des articles');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les articles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (data: Article) => {
    try {
      setLoading(true);
      const newArticle = await blogService.create(data);
      setArticles(prev => [newArticle, ...prev]);
      toast({
        title: 'Succès',
        description: 'L\'article a été créé avec succès',
      });
      return newArticle;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'article',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateArticle = async (id: string, data: Partial<Article>) => {
    try {
      setLoading(true);
      const updatedArticle = await blogService.update(id, data);
      setArticles(prev =>
        prev.map(article =>
          article.id === id ? updatedArticle : article
        )
      );
      toast({
        title: 'Succès',
        description: 'L\'article a été mis à jour avec succès',
      });
      return updatedArticle;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'article',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      setLoading(true);
      await blogService.delete(id);
      setArticles(prev => prev.filter(article => article.id !== id));
      toast({
        title: 'Succès',
        description: 'L\'article a été supprimé avec succès',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'article',
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
      const updatedArticle = await blogService.updateStatus(id, statut);
      setArticles(prev =>
        prev.map(article =>
          article.id === id ? updatedArticle : article
        )
      );
      toast({
        title: 'Succès',
        description: `L'article est maintenant ${statut === 'publié' ? 'publié' : 'en brouillon'}`,
      });
      return updatedArticle;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut de l\'article',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const planifierPublication = async (id: string, datePublication: Date) => {
    try {
      setLoading(true);
      const updatedArticle = await blogService.planifierPublication(id, datePublication);
      setArticles(prev =>
        prev.map(article =>
          article.id === id ? updatedArticle : article
        )
      );
      toast({
        title: 'Succès',
        description: 'La publication de l\'article a été planifiée',
      });
      return updatedArticle;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de planifier la publication de l\'article',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    articles,
    loading,
    error,
    pagination,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    updateStatus,
    planifierPublication,
  };
} 