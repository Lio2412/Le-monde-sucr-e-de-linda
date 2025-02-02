import '@testing-library/jest-dom';
import { server } from '@/mocks/server';

// Configuration globale pour les tests d'intégration
beforeAll(() => {
  // Démarrage du serveur MSW (Mock Service Worker)
  server.listen();
});

afterEach(() => {
  // Reset des handlers après chaque test
  server.resetHandlers();
});

afterAll(() => {
  // Arrêt du serveur MSW
  server.close();
});

// Mock du localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock des variables d'environnement
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/api'; 