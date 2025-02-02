import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

// Mock du hook useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  }))
}));

// Wrapper personnalisé pour les tests
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
}

// Réexporter tout depuis @testing-library/react
export * from '@testing-library/react'; 