import '@testing-library/jest-dom';

// Mock du Wake Lock API
const mockWakeLock = {
  request: jest.fn(),
  release: jest.fn(),
  sentinel: null,
};

global.navigator.wakeLock = {
  request: async (type) => {
    mockWakeLock.request(type);
    mockWakeLock.sentinel = {
      release: mockWakeLock.release,
    };
    return mockWakeLock.sentinel;
  },
};

global.mockWakeLock = {
  request: mockWakeLock.request,
  release: mockWakeLock.release,
  getSentinel: () => mockWakeLock.sentinel,
  reset: () => {
    mockWakeLock.request.mockReset();
    mockWakeLock.release.mockReset();
    mockWakeLock.sentinel = null;
  },
};

// Mock de l'API Fullscreen
let mockFullscreenElement = null;

Object.defineProperty(document, 'fullscreenEnabled', {
  configurable: true,
  get: () => true,
});

Object.defineProperty(document, 'fullscreenElement', {
  configurable: true,
  get: () => mockFullscreenElement,
  set: (value) => {
    mockFullscreenElement = value;
  },
});

document.exitFullscreen = jest.fn().mockImplementation(() => {
  mockFullscreenElement = null;
  return Promise.resolve();
});

global.mockFullscreenElement = {
  set: (element) => {
    mockFullscreenElement = element;
  },
  get: () => mockFullscreenElement,
};

// Réinitialisation des mocks après chaque test
afterEach(() => {
  mockFullscreenElement = null;
  document.exitFullscreen.mockClear();
  global.mockWakeLock.reset();
}); 