import { useState } from 'react';
import { mediasService, Media } from '@/services/medias.service';
import { useToast } from '@/components/ui/use-toast';

interface UseMediasParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  dossier?: string;
}

interface Dossier {
  id: string;
  nom: string;
  description?: string;
  _count?: {
    medias: number;
  };
}

export function useMedias(initialParams?: UseMediasParams) {
  const [medias, setMedias] = useState<Media[]>([]);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 20,
  });

  const { toast } = useToast();

  const fetchMedias = async (params?: UseMediasParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mediasService.getAll(params);
      setMedias(response.medias);
      setPagination(response.pagination);
    } catch (err) {
      setError('Erreur lors de la récupération des médias');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les médias',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDossiers = async () => {
    try {
      setLoading(true);
      const dossiers = await mediasService.getDossiers();
      setDossiers(dossiers);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les dossiers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadMedia = async (file: File, metadata?: Partial<Media>) => {
    try {
      setLoading(true);
      const newMedia = await mediasService.upload(file, metadata);
      setMedias(prev => [newMedia, ...prev]);
      toast({
        title: 'Succès',
        description: 'Le média a été uploadé avec succès',
      });
      return newMedia;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'uploader le média',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMedia = async (id: string, data: Partial<Media>) => {
    try {
      setLoading(true);
      const updatedMedia = await mediasService.update(id, data);
      setMedias(prev =>
        prev.map(media =>
          media.id === id ? updatedMedia : media
        )
      );
      toast({
        title: 'Succès',
        description: 'Le média a été mis à jour avec succès',
      });
      return updatedMedia;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le média',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      setLoading(true);
      await mediasService.delete(id);
      setMedias(prev => prev.filter(media => media.id !== id));
      toast({
        title: 'Succès',
        description: 'Le média a été supprimé avec succès',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le média',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createDossier = async (nom: string) => {
    try {
      setLoading(true);
      const newDossier = await mediasService.createDossier(nom);
      setDossiers(prev => [...prev, newDossier]);
      toast({
        title: 'Succès',
        description: 'Le dossier a été créé avec succès',
      });
      return newDossier;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le dossier',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deplacerMedia = async (id: string, dossier: string) => {
    try {
      setLoading(true);
      const updatedMedia = await mediasService.deplacerMedia(id, dossier);
      setMedias(prev =>
        prev.map(media =>
          media.id === id ? updatedMedia : media
        )
      );
      toast({
        title: 'Succès',
        description: 'Le média a été déplacé avec succès',
      });
      return updatedMedia;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de déplacer le média',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    medias,
    dossiers,
    loading,
    error,
    pagination,
    fetchMedias,
    fetchDossiers,
    uploadMedia,
    updateMedia,
    deleteMedia,
    createDossier,
    deplacerMedia,
  };
} 