import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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

// Mock de next/headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}));

// Mock de framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Supprimer les avertissements de console pendant les tests
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) {
    return;
  }
  if (args[0]?.includes?.('Invalid hook call')) {
    return;
  }
  originalError.call(console, ...args);
};

// Configuration globale pour les tests
beforeAll(() => {
  // Nettoyer localStorage avant chaque test
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

afterEach(() => {
  // Nettoyer les mocks après chaque test
  jest.clearAllMocks();
  localStorage.clear();
});

// Vous pouvez ajouter ici d'autres configurations globales pour Jest si nécessaire. 