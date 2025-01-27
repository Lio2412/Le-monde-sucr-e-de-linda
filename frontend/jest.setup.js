import '@testing-library/jest-dom';

// Configuration des faux timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

let fullscreenElement = null;
let wakeLockSentinel = null;

// Mock de l'API Fullscreen
Object.defineProperty(document, 'fullscreenEnabled', {
  configurable: true,
  get: () => true,
});

Object.defineProperty(document, 'fullscreenElement', {
  configurable: true,
  get: () => fullscreenElement,
  set: (value) => {
    fullscreenElement = value;
  },
});

document.exitFullscreen = jest.fn().mockImplementation(() => {
  fullscreenElement = null;
  return Promise.resolve();
});

// Fonction utilitaire pour les tests du mode plein écran
global.mockFullscreenElement = (element) => {
  fullscreenElement = element;
};

// Mock de l'API Wake Lock
const mockWakeLock = {
  request: jest.fn().mockImplementation(() => Promise.resolve({
    release: jest.fn().mockImplementation(() => Promise.resolve())
  })),
};

// Configuration globale du Wake Lock
Object.defineProperty(navigator, 'wakeLock', {
  configurable: true,
  value: mockWakeLock,
});

// Fonction utilitaire pour les tests du Wake Lock
global.mockWakeLock = {
  getSentinel: () => wakeLockSentinel,
  reset: () => {
    wakeLockSentinel = null;
    mockWakeLock.request.mockClear();
  },
  mock: mockWakeLock,
};

// Mock pour les animations
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

// Mock pour ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock pour les portails
Element.prototype.scrollIntoView = jest.fn();

// Augmenter le délai d'attente par défaut pour les tests
jest.setTimeout(15000);

// Réinitialisation des mocks après chaque test
afterEach(() => {
  fullscreenElement = null;
  document.exitFullscreen.mockClear();
  global.mockWakeLock.reset();
}); 