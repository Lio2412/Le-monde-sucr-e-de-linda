import { useState } from 'react';
import { tagsService, Tag } from '@/services/tags.service';
import { useToast } from '@/components/ui/use-toast';

interface UseTagsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'article' | 'recette';
}

interface TagAvecScore extends Tag {
  score: number;
}

export function useTags(initialParams?: UseTagsParams) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsPopulaires, setTagsPopulaires] = useState<TagAvecScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 20,
  });

  const { toast } = useToast();

  const fetchTags = async (params?: UseTagsParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tagsService.getAll(params);
      setTags(response.tags);
      setPagination(response.pagination);
    } catch (err) {
      setError('Erreur lors de la récupération des tags');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les tags',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTagsPopulaires = async (params?: { limit?: number; type?: 'article' | 'recette' }) => {
    try {
      setLoading(true);
      const tagsPopulaires = await tagsService.getPopulaires(params);
      setTagsPopulaires(tagsPopulaires);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les tags populaires',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const nouveauTag = await tagsService.create(data);
      setTags(prev => [nouveauTag, ...prev]);
      toast({
        title: 'Succès',
        description: 'Le tag a été créé avec succès',
      });
      return nouveauTag;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le tag',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTag = async (id: string, data: Partial<Tag>) => {
    try {
      setLoading(true);
      const tagMisAJour = await tagsService.update(id, data);
      setTags(prev =>
        prev.map(tag =>
          tag.id === id ? tagMisAJour : tag
        )
      );
      toast({
        title: 'Succès',
        description: 'Le tag a été mis à jour avec succès',
      });
      return tagMisAJour;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le tag',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (id: string) => {
    try {
      setLoading(true);
      await tagsService.delete(id);
      setTags(prev => prev.filter(tag => tag.id !== id));
      toast({
        title: 'Succès',
        description: 'Le tag a été supprimé avec succès',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le tag',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fusionnerTags = async (sourceId: string, destinationId: string) => {
    try {
      setLoading(true);
      const tagMisAJour = await tagsService.fusionner(sourceId, destinationId);
      setTags(prev => {
        const newTags = prev.filter(tag => tag.id !== sourceId);
        const index = newTags.findIndex(tag => tag.id === destinationId);
        if (index !== -1) {
          newTags[index] = tagMisAJour;
        }
        return newTags;
      });
      toast({
        title: 'Succès',
        description: 'Les tags ont été fusionnés avec succès',
      });
      return tagMisAJour;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de fusionner les tags',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tags,
    tagsPopulaires,
    loading,
    error,
    pagination,
    fetchTags,
    fetchTagsPopulaires,
    createTag,
    updateTag,
    deleteTag,
    fusionnerTags,
  };
} 