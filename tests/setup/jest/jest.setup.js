import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import './mocks';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suppression des avertissements de console pendant les tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning/.test(args[0]) ||
      /Not implemented/.test(args[0]) ||
      /invalid prop/.test(args[0]) ||
      /Failed prop type/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      /Warning/.test(args[0]) ||
      /Not implemented/.test(args[0]) ||
      /invalid prop/.test(args[0]) ||
      /Failed prop type/.test(args[0])
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});