import { Commentaire } from '@/types/commentaire';

export interface NotificationEvent {
  type: 'commentaire_nouveau' | 'commentaire_signale' | 'commentaire_reponse';
  data: Commentaire;
  timestamp: string;
}

class NotificationsService {
  private readonly API_URL = '/api/notifications';
  private eventSource: EventSource | null = null;
  private listeners: Map<string, ((event: NotificationEvent) => void)[]> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.requestNotificationPermission();
    }
  }

  private async requestNotificationPermission() {
    if (!('Notification' in window)) return;

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      await Notification.requestPermission();
    }
  }

  connect() {
    if (this.eventSource) return;

    this.eventSource = new EventSource(this.API_URL);

    this.eventSource.onmessage = (event) => {
      try {
        const notificationEvent: NotificationEvent = JSON.parse(event.data);
        this.notifyListeners(notificationEvent);
        this.showSystemNotification(notificationEvent);
      } catch (error) {
        console.error('Erreur lors du traitement de la notification:', error);
      }
    };

    this.eventSource.onerror = () => {
      this.disconnect();
      // Tentative de reconnexion après 5 secondes
      setTimeout(() => this.connect(), 5000);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  subscribe(callback: (event: NotificationEvent) => void): () => void {
    const id = Math.random().toString(36).substring(7);
    if (!this.listeners.has('notification')) {
      this.listeners.set('notification', []);
    }
    this.listeners.get('notification')?.push(callback);

    // Retourner une fonction de nettoyage
    return () => {
      const callbacks = this.listeners.get('notification');
      if (callbacks) {
        this.listeners.set(
          'notification',
          callbacks.filter(cb => cb !== callback)
        );
      }
    };
  }

  private notifyListeners(event: NotificationEvent) {
    const callbacks = this.listeners.get('notification');
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  private showSystemNotification(event: NotificationEvent) {
    if (Notification.permission !== 'granted') return;

    const title = this.getNotificationTitle(event);
    const body = this.getNotificationBody(event);

    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: event.type,
      renotify: true,
    });
  }

  private getNotificationTitle(event: NotificationEvent): string {
    switch (event.type) {
      case 'commentaire_nouveau':
        return 'Nouveau commentaire';
      case 'commentaire_signale':
        return 'Commentaire signalé';
      case 'commentaire_reponse':
        return 'Nouvelle réponse';
      default:
        return 'Notification';
    }
  }

  private getNotificationBody(event: NotificationEvent): string {
    const { data } = event;
    switch (event.type) {
      case 'commentaire_nouveau':
        return `${data.auteurNom} a laissé un nouveau commentaire`;
      case 'commentaire_signale':
        return `Un commentaire de ${data.auteurNom} a été signalé`;
      case 'commentaire_reponse':
        return `${data.auteurNom} a répondu à un commentaire`;
      default:
        return 'Une nouvelle notification est disponible';
    }
  }

  async markAsRead(notificationId: string) {
    const response = await fetch(`${this.API_URL}/${notificationId}/read`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du marquage de la notification comme lue');
    }
  }

  async markAllAsRead() {
    const response = await fetch(`${this.API_URL}/read-all`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du marquage de toutes les notifications comme lues');
    }
  }

  async getUnreadCount(): Promise<number> {
    const response = await fetch(`${this.API_URL}/unread-count`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du nombre de notifications non lues');
    }
    const data = await response.json();
    return data.count;
  }
}

export const notificationsService = new NotificationsService(); 