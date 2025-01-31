"use client";

import { createContext, useContext } from 'react';

interface NotificationsContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  unreadCount: 0,
  setUnreadCount: () => {},
  refreshNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  // Temporairement désactivé jusqu'à ce que le backend soit prêt
  return <>{children}</>;
} 