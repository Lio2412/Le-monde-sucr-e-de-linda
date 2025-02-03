import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ReactElement } from 'react';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: ReactElement }) => children,
  useSession: () => ({
    data: {
      user: { name: 'Test User' },
    },
    status: 'authenticated',
  }),
}));

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: '',
    asPath: '',
    push: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
  }),
}));

function customRender(ui: ReactElement, options = {}) {
  return rtlRender(ui, { ...options });
}

// Export everything
export * from '@testing-library/react';

// Export custom render method
export { customRender as render };
