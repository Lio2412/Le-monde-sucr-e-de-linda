import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/providers/AuthProvider';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock des services
jest.mock('@/services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getMe: jest.fn(),
  isAuthenticated: jest.fn(),
}));

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

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
export { customRender as render }; 