import React from 'react';
import { render } from '@testing-library/react';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// Mock du routeur Next.js
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  replace: jest.fn(),
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

// Mock du contexte du routeur
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Wrapper personnalisé pour les tests
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AppRouterContext.Provider value={mockRouter as any}>
      {ui}
    </AppRouterContext.Provider>
  );
}

// Réinitialiser les mocks entre les tests
export function clearMocks() {
  mockRouter.push.mockClear();
  mockRouter.back.mockClear();
  mockRouter.forward.mockClear();
  mockRouter.refresh.mockClear();
  mockRouter.prefetch.mockClear();
  mockRouter.replace.mockClear();
}

export { mockRouter }; 