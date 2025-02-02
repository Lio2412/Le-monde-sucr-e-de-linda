export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  reload: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '',
  isReady: true,
  isPreview: false,
  isLocaleDomain: false
};

// Mock de useRouter
export function useRouter() {
  return mockRouter;
}

// Export par défaut pour le mock complet
export default {
  useRouter,
  push: mockRouter.push,
  replace: mockRouter.replace
}; 