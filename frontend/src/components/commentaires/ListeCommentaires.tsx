import { useState, useEffect } from 'react';
import { useCommentaires } from '@/hooks/useCommentaires';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, Flag, ThumbsUp, Reply, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

interface ListeCommentairesProps {
  contenuType: 'article' | 'recette';
  contenuId: string;
  auteurId?: string;
  auteurNom?: string;
  auteurEmail?: string;
}

export function ListeCommentaires({
  contenuType,
  contenuId,
  auteurId,
  auteurNom,
  auteurEmail,
}: ListeCommentairesProps) {
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [reponseA, setReponseA] = useState<string | null>(null);
  const [showSignalerDialog, setShowSignalerDialog] = useState(false);
  const [commentaireASignaler, setCommentaireASignaler] = useState<string | null>(null);
  const [motifSignalement, setMotifSignalement] = useState('');
  const [showConnexionDialog, setShowConnexionDialog] = useState(false);
  const [nomTemp, setNomTemp] = useState('');
  const [emailTemp, setEmailTemp] = useState('');
  const [page, setPage] = useState(1);
  const [tri, setTri] = useState<'recent' | 'ancien' | 'populaire'>('recent');

  const {
    commentaires,
    loading,
    error,
    pagination,
    createCommentaire,
    signalerCommentaire,
    fetchCommentaires,
    ajouterReaction,
    supprimerReaction,
  } = useCommentaires({
    contenuType,
    contenuId,
    statut: 'approuve',
    page,
    limit: 10,
  });

  useEffect(() => {
    fetchCommentaires({
      page,
      limit: 10,
      orderBy: tri === 'recent' ? 'desc' : tri === 'ancien' ? 'asc' : undefined,
    });
  }, [fetchCommentaires, page, tri]);

  const handleSubmitCommentaire = async () => {
    if (!auteurId && (!nomTemp || !emailTemp)) {
      setShowConnexionDialog(true);
      return;
    }

    try {
      await createCommentaire({
        contenu: nouveauCommentaire,
        contenuType,
        contenuId,
        parentId: reponseA || undefined,
        auteurId: auteurId || 'visiteur',
        auteurNom: auteurNom || nomTemp,
        auteurEmail: auteurEmail || emailTemp,
        statut: 'en_attente',
      });
      setNouveauCommentaire('');
      setReponseA(null);
      setNomTemp('');
      setEmailTemp('');
      setShowConnexionDialog(false);
      // Recharger les commentaires après l'ajout
      fetchCommentaires({ page: 1 });
      setPage(1);
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error);
    }
  };

  const handleSignaler = async () => {
    if (commentaireASignaler && motifSignalement) {
      await signalerCommentaire(commentaireASignaler, motifSignalement);
      setShowSignalerDialog(false);
      setMotifSignalement('');
      setCommentaireASignaler(null);
    }
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeTri = (value: string) => {
    setTri(value as 'recent' | 'ancien' | 'populaire');
    setPage(1);
  };

  const renderCommentaire = (commentaire: any, niveau = 0) => {
    const reactions = {
      like: commentaire.reactions?.like || 0,
      love: commentaire.reactions?.love || 0,
      haha: commentaire.reactions?.haha || 0,
      wow: commentaire.reactions?.wow || 0,
      sad: commentaire.reactions?.sad || 0,
      angry: commentaire.reactions?.angry || 0,
    };

    const reactionIcons = {
      like: '👍',
      love: '❤️',
      haha: '😄',
      wow: '😮',
      sad: '😢',
      angry: '😠',
    };

    const [showReactions, setShowReactions] = useState(false);

    return (
      <div
        key={commentaire.id}
        className={cn(
          "p-4 rounded-lg border mb-4",
          niveau > 0 && "ml-8 bg-gray-50"
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold">{commentaire.auteurNom}</div>
            <div className="text-sm text-gray-500">
              {format(new Date(commentaire.createdAt), 'Pp', { locale: fr })}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCommentaireASignaler(commentaire.id);
              setShowSignalerDialog(true);
            }}
          >
            <Flag className="w-4 h-4 mr-1" />
            Signaler
          </Button>
        </div>
        
        <div className="mt-2">{commentaire.contenu}</div>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReactions(!showReactions)}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Réagir
            </Button>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg border flex gap-1 z-10"
              >
                {Object.entries(reactionIcons).map(([type, icon]) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => {
                      ajouterReaction(commentaire.id, type as any);
                      setShowReactions(false);
                    }}
                  >
                    {icon}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReponseA(commentaire.id)}
          >
            <Reply className="w-4 h-4 mr-1" />
            Répondre
          </Button>
        </div>

        {Object.entries(reactions).some(([_, count]) => count > 0) && (
          <motion.div layout className="mt-2 flex flex-wrap gap-2">
            <AnimatePresence>
              {Object.entries(reactions).map(([type, count]) => count > 0 && (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  layout
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  onClick={() => supprimerReaction(commentaire.id, type as any)}
                >
                  <motion.span
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {reactionIcons[type as keyof typeof reactionIcons]}
                  </motion.span>
                  <motion.span
                    key={count}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {count}
                  </motion.span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {commentaire.reponses && commentaire.reponses.length > 0 && (
          <div className="mt-4">
            {commentaire.reponses.map((reponse: any) => 
              renderCommentaire(reponse, niveau + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Une erreur est survenue lors du chargement des commentaires.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h2 className="text-xl font-semibold">
            Commentaires ({pagination?.total || 0})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="tri">Trier par</Label>
          <Select value={tri} onValueChange={handleChangeTri}>
            <SelectTrigger id="tri" className="w-[180px]">
              <SelectValue placeholder="Trier les commentaires" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="ancien">Plus anciens</SelectItem>
              <SelectItem value="populaire">Plus populaires</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Ajouter un commentaire..."
          value={nouveauCommentaire}
          onChange={(e) => setNouveauCommentaire(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitCommentaire}
            disabled={!nouveauCommentaire.trim()}
          >
            {reponseA ? 'Répondre' : 'Commenter'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {commentaires.map((commentaire) => 
            !commentaire.parentId && renderCommentaire(commentaire)
          )}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={pageNumber === page ? "default" : "outline"}
                size="sm"
                onClick={() => handleChangePage(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(page + 1)}
            disabled={page === pagination.pages}
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Dialog open={showSignalerDialog} onOpenChange={setShowSignalerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler un commentaire</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du signalement.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="motifSignalement">Motif du signalement</Label>
            <Textarea
              id="motifSignalement"
              value={motifSignalement}
              onChange={(e) => setMotifSignalement(e.target.value)}
              placeholder="Expliquez pourquoi vous signalez ce commentaire..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSignalerDialog(false);
                setMotifSignalement('');
                setCommentaireASignaler(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSignaler}
              disabled={!motifSignalement}
            >
              Signaler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConnexionDialog} onOpenChange={setShowConnexionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Identification requise</DialogTitle>
            <DialogDescription>
              Veuillez fournir votre nom et votre email pour poster un commentaire.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={nomTemp}
                onChange={(e) => setNomTemp(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={emailTemp}
                onChange={(e) => setEmailTemp(e.target.value)}
                placeholder="votre@email.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConnexionDialog(false);
                setNomTemp('');
                setEmailTemp('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitCommentaire}
              disabled={!nomTemp || !emailTemp}
            >
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 