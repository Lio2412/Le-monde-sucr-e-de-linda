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

// Configuration globale pour les tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock pour l'API Fullscreen
Object.defineProperty(document, 'fullscreenEnabled', {
    writable: true,
    value: true,
});

Object.defineProperty(document, 'fullscreenElement', {
    writable: true,
    value: null,
});

document.documentElement.requestFullscreen = jest.fn();
document.exitFullscreen = jest.fn();

// Mock pour window.matchMedia
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

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

// Mock IntersectionObserver
class IntersectionObserver {
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
}
window.IntersectionObserver = IntersectionObserver;

// Mock window.scroll
window.scroll = jest.fn();
window.scrollTo = jest.fn();

// Mock Performance API
if (typeof window.performance === 'undefined') {
  window.performance = {
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue([{ duration: 0 }]),
  };
}

// Mock requestAnimationFrame
global.requestAnimationFrame = callback => setTimeout(callback, 0);
global.cancelAnimationFrame = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock; 