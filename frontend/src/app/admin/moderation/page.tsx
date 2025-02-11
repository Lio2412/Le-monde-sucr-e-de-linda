"use client";

import { useState } from 'react';
import { useCommentaires } from '@/hooks/useCommentaires';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, MoreVertical, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

interface Commentaire {
  id: string;
  auteurNom: string;
  auteurEmail: string;
  contenu: string;
  createdAt: string;
  statut: 'en_attente' | 'approuve' | 'rejete' | 'signale';
  parentId?: string;
}

export default function ModerationPage() {
  const [selectedStatut, setSelectedStatut] = useState<string>('en_attente');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommentaires, setSelectedCommentaires] = useState<string[]>([]);

  const {
    commentaires,
    loading,
    error,
    pagination,
    approuverCommentaire,
    rejeterCommentaire,
    deleteCommentaire,
    actionMasse,
  } = useCommentaires({
    statut: selectedStatut,
    search: searchTerm,
    page: 1,
    limit: 20,
  });

  const handleSelectAll = () => {
    if (selectedCommentaires.length === commentaires.length) {
      setSelectedCommentaires([]);
    } else {
      setSelectedCommentaires(commentaires.map(c => c.id).filter((id): id is string => id !== undefined));
    }
  };

  const handleSelectCommentaire = (id: string) => {
    setSelectedCommentaires(prev =>
      prev.includes(id)
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  const handleActionMasse = async (action: 'approuver' | 'rejeter' | 'supprimer') => {
    if (selectedCommentaires.length === 0) return;
    await actionMasse(action);
    setSelectedCommentaires([]);
  };

  const getStatutBadge = (statut: string) => {
    const variants = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      approuve: 'bg-green-100 text-green-800',
      rejete: 'bg-red-100 text-red-800',
      signale: 'bg-purple-100 text-purple-800',
    };
    return variants[statut as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Modération des Commentaires</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={selectedStatut} onValueChange={setSelectedStatut}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="approuve">Approuvé</SelectItem>
                <SelectItem value="rejete">Rejeté</SelectItem>
                <SelectItem value="signale">Signalé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedCommentaires.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
          >
            <span className="text-sm text-gray-600">
              {selectedCommentaires.length} commentaire(s) sélectionné(s)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActionMasse('approuver')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approuver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActionMasse('rejeter')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Rejeter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleActionMasse('supprimer')}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">
            Une erreur est survenue lors du chargement des commentaires.
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedCommentaires.length === commentaires.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Contenu</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {commentaires.map((commentaire) => (
                    <motion.tr
                      key={commentaire.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-gray-50"
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedCommentaires.includes(commentaire.id)}
                          onChange={() => handleSelectCommentaire(commentaire.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{commentaire.auteurNom}</div>
                          <div className="text-sm text-gray-500">{commentaire.auteurEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xl truncate">{commentaire.contenu}</div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(commentaire.createdAt), 'Pp', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatutBadge(commentaire.statut)}>
                          {commentaire.statut.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => approuverCommentaire(commentaire.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approuver
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => rejeterCommentaire(commentaire.id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rejeter
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteCommentaire(commentaire.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </div>
  );
} 