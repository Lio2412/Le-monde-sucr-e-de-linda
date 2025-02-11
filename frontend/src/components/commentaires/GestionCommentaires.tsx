import { useState, useEffect } from 'react';
import { useCommentaires } from '@/hooks/useCommentaires';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface GestionCommentairesProps {
  contenuType?: 'article' | 'recette';
  contenuId?: string;
}

export function GestionCommentaires({ contenuType, contenuId }: GestionCommentairesProps) {
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState<string>('');
  const [motifRejet, setMotifRejet] = useState('');
  const [showRejetDialog, setShowRejetDialog] = useState(false);
  const [commentaireArejeter, setCommentaireArejeter] = useState<string | null>(null);

  const {
    commentaires,
    loading,
    error,
    pagination,
    commentairesSelectionnes,
    fetchCommentaires,
    approuverCommentaire,
    rejeterCommentaire,
    signalerCommentaire,
    actionMasse,
    toggleSelection,
    selectAll,
    deselectAll,
  } = useCommentaires({
    contenuType,
    contenuId,
    limit: 10,
  });

  useEffect(() => {
    fetchCommentaires({ search, statut });
  }, [fetchCommentaires, search, statut]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleStatutChange = (value: string) => {
    setStatut(value);
  };

  const handleApprouver = async (id: string) => {
    await approuverCommentaire(id);
    fetchCommentaires();
  };

  const handleRejeter = async (id: string) => {
    setCommentaireArejeter(id);
    setShowRejetDialog(true);
  };

  const handleConfirmRejet = async () => {
    if (commentaireArejeter && motifRejet) {
      await rejeterCommentaire(commentaireArejeter, motifRejet);
      setShowRejetDialog(false);
      setMotifRejet('');
      setCommentaireArejeter(null);
      fetchCommentaires();
    }
  };

  const handleActionMasse = async (action: 'approuver' | 'rejeter' | 'supprimer') => {
    if (action === 'rejeter') {
      setShowRejetDialog(true);
    } else {
      await actionMasse(action);
      fetchCommentaires();
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'approuve':
        return <span className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-1" /> Approuvé</span>;
      case 'rejete':
        return <span className="flex items-center text-red-600"><XCircle className="w-4 h-4 mr-1" /> Rejeté</span>;
      case 'signale':
        return <span className="flex items-center text-yellow-600"><AlertTriangle className="w-4 h-4 mr-1" /> Signalé</span>;
      default:
        return <span className="text-gray-600">En attente</span>;
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Une erreur est survenue lors du chargement des commentaires.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Rechercher</Label>
          <Input
            id="search"
            placeholder="Rechercher dans les commentaires..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Label htmlFor="statut">Statut</Label>
          <Select value={statut} onValueChange={handleStatutChange}>
            <SelectTrigger id="statut">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="approuve">Approuvé</SelectItem>
              <SelectItem value="rejete">Rejeté</SelectItem>
              <SelectItem value="signale">Signalé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {commentairesSelectionnes.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
          <span>{commentairesSelectionnes.length} sélectionné(s)</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleActionMasse('approuver')}
          >
            Approuver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleActionMasse('rejeter')}
          >
            Rejeter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleActionMasse('supprimer')}
          >
            Supprimer
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={deselectAll}
          >
            Désélectionner tout
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={commentairesSelectionnes.length === commentaires.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Contenu</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commentaires.map((commentaire) => (
                <TableRow key={commentaire.id}>
                  <TableCell>
                    <Checkbox
                      checked={commentaire.id ? commentairesSelectionnes.includes(commentaire.id) : false}
                      onCheckedChange={() => {
                        if (commentaire.id) {
                          toggleSelection(commentaire.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div>{commentaire.auteurNom}</div>
                    <div className="text-sm text-gray-500">{commentaire.auteurEmail}</div>
                  </TableCell>
                  <TableCell>{commentaire.contenu}</TableCell>
                  <TableCell>
                    {commentaire.createdAt && format(new Date(commentaire.createdAt), 'Pp', { locale: fr })}
                  </TableCell>
                  <TableCell>{getStatutBadge(commentaire.statut)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {commentaire.statut === 'en_attente' && commentaire.id && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (commentaire.id) {
                                handleApprouver(commentaire.id);
                              }
                            }}
                          >
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (commentaire.id) {
                                handleRejeter(commentaire.id);
                              }
                            }}
                          >
                            Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showRejetDialog} onOpenChange={setShowRejetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le(s) commentaire(s)</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="motifRejet">Motif du rejet</Label>
            <Textarea
              id="motifRejet"
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
              placeholder="Expliquez pourquoi ce commentaire est rejeté..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejetDialog(false);
                setMotifRejet('');
                setCommentaireArejeter(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmRejet}
              disabled={!motifRejet}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 