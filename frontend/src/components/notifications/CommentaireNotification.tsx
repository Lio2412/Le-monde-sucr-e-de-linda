"use client";

import { useEffect, useState } from 'react';
import { Bell, MessageSquare, CheckCircle, XCircle, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Commentaire } from '@/types/commentaire';

interface CommentaireNotificationProps {
  onAction?: (commentaireId: string, action: 'approuver' | 'rejeter' | 'supprimer') => void;
}

export function CommentaireNotification({ onAction }: CommentaireNotificationProps) {
  const [notifications, setNotifications] = useState<Commentaire[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simuler une connexion WebSocket pour les notifications en temps réel
    const eventSource = new EventSource('/api/notifications/commentaires');

    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
      
      // Notification système
      if (Notification.permission === 'granted') {
        new Notification('Nouveau commentaire', {
          body: `${notification.auteurNom} a laissé un commentaire`,
          icon: '/favicon.ico'
        });
      }
    };

    return () => eventSource.close();
  }, []);

  const handleAction = async (commentaireId: string, action: 'approuver' | 'rejeter' | 'supprimer') => {
    try {
      await onAction?.(commentaireId, action);
      setNotifications(prev => prev.filter(n => n.id !== commentaireId));
      
      toast({
        title: "Action effectuée",
        description: `Le commentaire a été ${action === 'approuver' ? 'approuvé' : action === 'rejeter' ? 'rejeté' : 'supprimé'} avec succès.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'action sur le commentaire.",
      });
    }
  };

  const getNotificationIcon = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return <MessageSquare className="w-4 h-4 text-yellow-500" />;
      case 'signale':
        return <Flag className="w-4 h-4 text-red-500" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {notifications.length}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-96 z-50"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''} en attente
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="mb-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.statut)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{notification.auteurNom}</span>
                            <Badge variant={notification.statut === 'signale' ? 'destructive' : 'secondary'}>
                              {notification.statut.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.contenu}</p>
                          <span className="text-xs text-gray-400 mt-2 block">
                            {format(new Date(notification.createdAt), 'Pp', { locale: fr })}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(notification.id, 'rejeter')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction(notification.id, 'approuver')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approuver
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
              {notifications.length === 0 && (
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Aucune notification</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 