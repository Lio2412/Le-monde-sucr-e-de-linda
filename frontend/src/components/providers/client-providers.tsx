"use client";

import { NotificationsProvider } from './notifications-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '../ui/toaster';
import { AuthProvider } from './auth-provider';

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
      <AuthProvider>
        <NotificationsProvider>
          {children}
          <Toaster />
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 