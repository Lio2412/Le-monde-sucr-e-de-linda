import { useState } from 'react';
import { planificationService, Planification } from '@/services/planification.service';
import { useToast } from '@/components/ui/use-toast';

interface UsePlanificationParams {
  page?: number;
  limit?: number;
  contenuType?: string;
  statut?: string;
  dateDebut?: Date;
  dateFin?: Date;
}

interface CalendrierJour {
  jour: number;
  planifications: Planification[];
}

interface CalendrierMois {
  annee: number;
  mois: number;
  nombreJours: number;
  premierJour: number;
  calendrier: CalendrierJour[];
}

export function usePlanification(initialParams?: UsePlanificationParams) {
  const [planifications, setPlanifications] = useState<Planification[]>([]);
  const [calendrier, setCalendrier] = useState<CalendrierMois | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 20,
  });

  const { toast } = useToast();

  const fetchPlanifications = async (params?: UsePlanificationParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await planificationService.getAll(params);
      setPlanifications(response.planifications);
      setPagination(response.pagination);
    } catch (err) {
      setError('Erreur lors de la récupération des planifications');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les planifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const planifier = async (data: Omit<Planification, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const nouvellePlanification = await planificationService.planifier(data);
      setPlanifications(prev => [nouvellePlanification, ...prev]);
      toast({
        title: 'Succès',
        description: 'La publication a été planifiée avec succès',
      });
      return nouvellePlanification;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de planifier la publication',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const annuler = async (id: string) => {
    try {
      setLoading(true);
      const planificationAnnulee = await planificationService.annuler(id);
      setPlanifications(prev =>
        prev.map(p =>
          p.id === id ? planificationAnnulee : p
        )
      );
      toast({
        title: 'Succès',
        description: 'La planification a été annulée avec succès',
      });
      return planificationAnnulee;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'annuler la planification',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const replanifier = async (id: string, nouvelleDatePublication: Date) => {
    try {
      setLoading(true);
      const planificationMiseAJour = await planificationService.replanifier(id, nouvelleDatePublication);
      setPlanifications(prev =>
        prev.map(p =>
          p.id === id ? planificationMiseAJour : p
        )
      );
      toast({
        title: 'Succès',
        description: 'La publication a été replanifiée avec succès',
      });
      return planificationMiseAJour;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de replanifier la publication',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchProchaines = async (limit: number = 5) => {
    try {
      setLoading(true);
      const prochaines = await planificationService.getProchaines(limit);
      setPlanifications(prochaines);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prochaines publications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendrier = async (annee: number, mois: number) => {
    try {
      setLoading(true);
      const calendrierMois = await planificationService.getCalendrier(annee, mois);
      setCalendrier(calendrierMois);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le calendrier',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    planifications,
    calendrier,
    loading,
    error,
    pagination,
    fetchPlanifications,
    planifier,
    annuler,
    replanifier,
    fetchProchaines,
    fetchCalendrier,
  };
} 