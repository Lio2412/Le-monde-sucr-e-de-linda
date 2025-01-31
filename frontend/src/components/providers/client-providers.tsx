"use client";

import { NotificationsProvider } from './notifications-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '../ui/toaster';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <NotificationsProvider>
        {children}
        <Toaster />
      </NotificationsProvider>
    </ThemeProvider>
  );
} 