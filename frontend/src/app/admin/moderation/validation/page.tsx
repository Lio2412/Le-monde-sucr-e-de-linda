"use client";

import { useState } from 'react';
import { useCommentaires } from '@/hooks/useCommentaires';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

export default function ValidationPage() {
  const [motifRejet, setMotifRejet] = useState('');
  const [commentaireAModerer, setCommentaireAModerer] = useState<string | null>(null);
  const [showRejetDialog, setShowRejetDialog] = useState(false);
  const { toast } = useToast();

  const {
    commentaires,
    loading,
    error,
    approuverCommentaire,
    rejeterCommentaire,
  } = useCommentaires({
    statut: 'en_attente',
    limit: 10,
  });

  const handleApprouver = async (id: string) => {
    try {
      await approuverCommentaire(id);
      toast({
        title: "Commentaire approuvé",
        description: "Le commentaire a été approuvé avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation du commentaire.",
      });
    }
  };

  const handleRejeter = async () => {
    if (!commentaireAModerer || !motifRejet) return;
    
    try {
      await rejeterCommentaire(commentaireAModerer, motifRejet);
      setShowRejetDialog(false);
      setMotifRejet('');
      setCommentaireAModerer(null);
      toast({
        title: "Commentaire rejeté",
        description: "Le commentaire a été rejeté avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet du commentaire.",
      });
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h1 className="text-2xl font-bold">Validation des Commentaires</h1>
          </div>
          <Badge variant="secondary" className="text-sm">
            {commentaires.length} en attente
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-600">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Une erreur est survenue lors du chargement des commentaires.
          </div>
        ) : commentaires.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mb-4" />
            <p className="text-lg">Aucun commentaire en attente de validation</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {commentaires.map((commentaire) => (
                <motion.div
                  key={commentaire.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{commentaire.auteurNom}</span>
                        <Badge>En attente</Badge>
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(commentaire.createdAt), 'Pp', { locale: fr })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{commentaire.contenu}</p>
                      {commentaire.parentId && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                          <span className="font-medium">En réponse à :</span>
                          <p className="mt-1 text-gray-600">{commentaire.parent?.contenu}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCommentaireAModerer(commentaire.id);
                          setShowRejetDialog(true);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                      <Button
                        onClick={() => handleApprouver(commentaire.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <Dialog open={showRejetDialog} onOpenChange={setShowRejetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le commentaire</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet. Cette information sera envoyée à l'auteur du commentaire.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
              placeholder="Motif du rejet..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejetDialog(false);
                setMotifRejet('');
                setCommentaireAModerer(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleRejeter}
              disabled={!motifRejet.trim()}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 