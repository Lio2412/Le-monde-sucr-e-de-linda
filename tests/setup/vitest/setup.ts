import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Updated Mock Chakra UI components
vi.mock('@chakra-ui/react', () => {
  const actual = vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    ChakraProvider: ({ children }: { children: React.ReactNode }) => children,
    FormControl: ({ children, isRequired, id }: { children: React.ReactNode; isRequired?: boolean; id?: string }) => (
      React.createElement('div', { 'data-testid': `form-control-${id}` }, [
        isRequired && React.createElement('span', { 'data-testid': 'required-field' }),
        children
      ])
    ),
    FormLabel: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => 
      React.createElement('label', { htmlFor: htmlFor || children?.toString().toLowerCase() }, children),
    FormErrorMessage: ({ children }: { children: React.ReactNode }) => 
      React.createElement('div', { role: 'alert' }, children),
    Input: React.forwardRef((props: any, ref) => {
      const id = props.id || props.name;
      return React.createElement('input', {
        id,
        ref,
        type: props.type,
        name: props.name,
        value: props.value,
        onChange: props.onChange,
        'aria-label': props['aria-label'] || props.name,
      });
    }),
    Button: React.forwardRef((props: any, ref) => 
      React.createElement('button', {
        ref,
        type: props.type,
        onClick: props.onClick,
        disabled: props.isLoading
      }, props.isLoading ? 'Loading...' : props.children)
    ),
    Alert: ({ status, children }: { status?: string; children: React.ReactNode }) => 
      React.createElement('div', { role: 'alert', 'data-status': status }, children),
    AlertIcon: () => React.createElement('span', null, '⚠️'),
    Box: ({ as = 'div', children, ...props }: { as?: any; children: React.ReactNode }) => 
      React.createElement(as, props, children),
  };
});

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    user: null,
  }),
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
