"use client";

import { useState } from 'react';
import { useCommentaires } from '@/hooks/useCommentaires';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, AlertTriangle, Send, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReponseFormState {
  commentaireId: string;
  contenu: string;
}

export default function ReponsesPage() {
  const [reponseForm, setReponseForm] = useState<ReponseFormState | null>(null);
  const [filtre, setFiltre] = useState<'tous' | 'sans_reponse' | 'avec_reponse'>('tous');
  const { toast } = useToast();

  const {
    commentaires,
    loading,
    error,
    createCommentaire,
  } = useCommentaires({
    statut: 'approuve',
    limit: 20,
  });

  const handleEnvoyerReponse = async () => {
    if (!reponseForm || !reponseForm.contenu.trim()) return;

    try {
      await createCommentaire({
        contenu: reponseForm.contenu,
        parentId: reponseForm.commentaireId,
        auteurId: 'admin',
        auteurNom: 'Administrateur',
        statut: 'approuve',
      });

      toast({
        title: "Réponse envoyée",
        description: "Votre réponse a été publiée avec succès.",
      });

      setReponseForm(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la réponse.",
      });
    }
  };

  const commentairesFiltres = commentaires.filter(commentaire => {
    switch (filtre) {
      case 'sans_reponse':
        return !commentaire.reponses?.length;
      case 'avec_reponse':
        return commentaire.reponses?.length > 0;
      default:
        return true;
    }
  });

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Reply className="w-5 h-5" />
            <h1 className="text-2xl font-bold">Réponses aux Commentaires</h1>
          </div>
          <Select value={filtre} onValueChange={(value: any) => setFiltre(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer les commentaires" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les commentaires</SelectItem>
              <SelectItem value="sans_reponse">Sans réponse</SelectItem>
              <SelectItem value="avec_reponse">Avec réponse</SelectItem>
            </SelectContent>
          </Select>
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
        ) : commentairesFiltres.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle className="w-12 h-12 mb-4" />
            <p className="text-lg">Aucun commentaire trouvé</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {commentairesFiltres.map((commentaire) => (
                <motion.div
                  key={commentaire.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{commentaire.auteurNom}</span>
                        <Badge variant={commentaire.reponses?.length ? "secondary" : "default"}>
                          {commentaire.reponses?.length ? "Répondu" : "En attente"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(commentaire.createdAt), 'Pp', { locale: fr })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">{commentaire.contenu}</p>
                      </div>

                      {commentaire.reponses?.map((reponse: any) => (
                        <motion.div
                          key={reponse.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="ml-8 p-4 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{reponse.auteurNom}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(reponse.createdAt), 'Pp', { locale: fr })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{reponse.contenu}</p>
                        </motion.div>
                      ))}

                      {reponseForm?.commentaireId === commentaire.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4"
                        >
                          <Textarea
                            value={reponseForm.contenu}
                            onChange={(e) => setReponseForm({
                              ...reponseForm,
                              contenu: e.target.value
                            })}
                            placeholder="Votre réponse..."
                            className="min-h-[100px] mb-2"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setReponseForm(null)}
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={handleEnvoyerReponse}
                              disabled={!reponseForm.contenu.trim()}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Envoyer
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                    {!reponseForm?.commentaireId === commentaire.id && (
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="ml-auto"
                          onClick={() => setReponseForm({
                            commentaireId: commentaire.id,
                            contenu: ''
                          })}
                        >
                          <Reply className="w-4 h-4 mr-1" />
                          Répondre
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
} 