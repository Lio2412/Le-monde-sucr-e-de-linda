import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { commentairesService, Commentaire } from '@/services/commentaires.service';

interface UseCommentairesParams {
  page?: number;
  limit?: number;
  search?: string;
  contenuType?: string;
  contenuId?: string;
  statut?: string;
  dateDebut?: Date;
  dateFin?: Date;
  orderBy?: 'asc' | 'desc';
}

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export function useCommentaires(params?: UseCommentairesParams) {
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [commentaireSelectionne, setCommentaireSelectionne] = useState<Commentaire | null>(null);
  const [commentairesSelectionnes, setCommentairesSelectionnes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 0,
    page: params?.page || 1,
    limit: params?.limit || 20,
  });

  const { toast } = useToast();

  // Récupérer tous les commentaires
  const fetchCommentaires = useCallback(async (newParams?: UseCommentairesParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentairesService.getAll({ ...params, ...newParams });
      setCommentaires(response.commentaires);
      setPagination(response.pagination);
      toast({
        title: "Succès",
        description: "Les commentaires ont été chargés avec succès",
      });
    } catch (err) {
      setError("Erreur lors du chargement des commentaires");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les commentaires",
      });
    } finally {
      setLoading(false);
    }
  }, [params, toast]);

  // Récupérer un commentaire par son ID
  const fetchCommentaireById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const commentaire = await commentairesService.getById(id);
      setCommentaireSelectionne(commentaire);
    } catch (err) {
      setError("Erreur lors du chargement du commentaire");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le commentaire",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Créer un nouveau commentaire
  const createCommentaire = useCallback(async (data: Omit<Commentaire, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const nouveauCommentaire = await commentairesService.create(data);
      setCommentaires(prev => [nouveauCommentaire, ...prev]);
      toast({
        title: "Succès",
        description: "Le commentaire a été créé avec succès",
      });
      return nouveauCommentaire;
    } catch (err) {
      setError("Erreur lors de la création du commentaire");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le commentaire",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Mettre à jour un commentaire
  const updateCommentaire = useCallback(async (id: string, data: Partial<Commentaire>) => {
    try {
      setLoading(true);
      setError(null);
      const commentaireMisAJour = await commentairesService.update(id, data);
      setCommentaires(prev => prev.map(c => c.id === id ? commentaireMisAJour : c));
      toast({
        title: "Succès",
        description: "Le commentaire a été mis à jour avec succès",
      });
      return commentaireMisAJour;
    } catch (err) {
      setError("Erreur lors de la mise à jour du commentaire");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le commentaire",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Supprimer un commentaire
  const deleteCommentaire = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await commentairesService.delete(id);
      setCommentaires(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Succès",
        description: "Le commentaire a été supprimé avec succès",
      });
    } catch (err) {
      setError("Erreur lors de la suppression du commentaire");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Approuver un commentaire
  const approuverCommentaire = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const commentaireMisAJour = await commentairesService.approuver(id);
      setCommentaires(prev => prev.map(c => c.id === id ? commentaireMisAJour : c));
      toast({
        title: "Succès",
        description: "Le commentaire a été approuvé avec succès",
      });
    } catch (err) {
      setError("Erreur lors de l'approbation du commentaire");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'approuver le commentaire",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Rejeter un commentaire
  const rejeterCommentaire = useCallback(async (id: string, motif: string) => {
    try {
      setLoading(true);
      setError(null);
      const commentaireMisAJour = await commentairesService.rejeter(id, motif);
      setCommentaires(prev => prev.map(c => c.id === id ? commentaireMisAJour : c));
      toast({
        title: "Succès",
        description: "Le commentaire a été rejeté avec succès",
      });
    } catch (err) {
      setError("Erreur lors du rejet du commentaire");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rejeter le commentaire",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Signaler un commentaire
  const signalerCommentaire = useCallback(async (id: string, motif: string) => {
    try {
      setLoading(true);
      setError(null);
      const commentaireMisAJour = await commentairesService.signaler(id, motif);
      setCommentaires(prev => prev.map(c => c.id === id ? commentaireMisAJour : c));
      toast({
        title: "Succès",
        description: "Le commentaire a été signalé avec succès",
      });
    } catch (err) {
      setError("Erreur lors du signalement du commentaire");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de signaler le commentaire",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Action en masse sur les commentaires
  const actionMasse = useCallback(async (action: 'approuver' | 'rejeter' | 'supprimer', motif?: string) => {
    try {
      setLoading(true);
      setError(null);
      const { commentaires: commentairesMisAJour } = await commentairesService.actionMasse(
        commentairesSelectionnes,
        action,
        motif
      );
      
      // Mettre à jour la liste des commentaires
      setCommentaires(prev => {
        const commentairesMap = new Map(commentairesMisAJour.map((c: Commentaire) => [c.id, c]));
        return prev.map((c: Commentaire) => commentairesMap.get(c.id) ?? c);
      });
      
      // Réinitialiser la sélection
      setCommentairesSelectionnes([]);
      
      toast({
        title: "Succès",
        description: `Les commentaires ont été ${action === 'approuver' ? 'approuvés' : action === 'rejeter' ? 'rejetés' : 'supprimés'} avec succès`,
      });
    } catch (err) {
      setError("Erreur lors de l'action en masse sur les commentaires");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'effectuer l'action en masse sur les commentaires",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [commentairesSelectionnes, toast]);

  // Gérer la sélection des commentaires
  const toggleSelection = useCallback((id: string) => {
    setCommentairesSelectionnes(prev => 
      prev.includes(id) 
        ? prev.filter(commentaireId => commentaireId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    const ids = commentaires.map(c => c.id).filter((id): id is string => id !== undefined);
    setCommentairesSelectionnes(ids);
  }, [commentaires]);

  const deselectAll = useCallback(() => {
    setCommentairesSelectionnes([]);
  }, []);

  const ajouterReaction = useCallback(async (commentaireId: string, type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') => {
    try {
      setLoading(true);
      setError(null);
      const commentaireMisAJour = await commentairesService.ajouterReaction(commentaireId, type);
      setCommentaires(prev => prev.map(c => c.id === commentaireId ? commentaireMisAJour : c));
      toast({
        title: "Succès",
        description: "Réaction ajoutée avec succès",
      });
    } catch (err) {
      setError("Erreur lors de l'ajout de la réaction");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter la réaction",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const supprimerReaction = useCallback(async (commentaireId: string, type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') => {
    try {
      setLoading(true);
      setError(null);
      const commentaireMisAJour = await commentairesService.supprimerReaction(commentaireId, type);
      setCommentaires(prev => prev.map(c => c.id === commentaireId ? commentaireMisAJour : c));
      toast({
        title: "Succès",
        description: "Réaction supprimée avec succès",
      });
    } catch (err) {
      setError("Erreur lors de la suppression de la réaction");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer la réaction",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    commentaires,
    commentaireSelectionne,
    commentairesSelectionnes,
    loading,
    error,
    pagination,
    fetchCommentaires,
    fetchCommentaireById,
    createCommentaire,
    updateCommentaire,
    deleteCommentaire,
    approuverCommentaire,
    rejeterCommentaire,
    signalerCommentaire,
    actionMasse,
    toggleSelection,
    selectAll,
    deselectAll,
    ajouterReaction,
    supprimerReaction,
  };
} 