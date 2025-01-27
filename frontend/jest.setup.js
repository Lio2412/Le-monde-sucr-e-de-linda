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

document.exitFullscreen = jest.fn().mockResolvedValue(undefined);

// Fonction utilitaire pour les tests du mode plein écran
global.mockFullscreenElement = {
  get: () => fullscreenElement,
  set: (value) => {
    fullscreenElement = value;
  },
};

// Mock de l'API Wake Lock
const mockWakeLock = {
  request: jest.fn().mockImplementation(async (type) => {
    if (type !== 'screen') {
      throw new Error('Invalid wake lock type');
    }
    wakeLockSentinel = {
      release: jest.fn().mockResolvedValue(undefined),
    };
    return wakeLockSentinel;
  }),
};

// Configuration globale du Wake Lock
Object.defineProperty(navigator, 'wakeLock', {
  configurable: true,
  get: () => mockWakeLock,
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

// Réinitialisation des mocks après chaque test
afterEach(() => {
  fullscreenElement = null;
  document.exitFullscreen.mockClear();
  global.mockWakeLock.reset();
}); 