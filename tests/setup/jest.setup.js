import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Configuration globale pour les tests
beforeAll(() => {
  // Démarrer le serveur MSW
  server.listen();
});

afterEach(() => {
  // Reset les handlers entre chaque test
  server.resetHandlers();
});

afterAll(() => {
  // Fermer le serveur MSW
  server.close();
});

// Configuration globale de Jest
jest.setTimeout(10000);

// Mock des variables d'environnement
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/api';

// Supprimer les warnings console pendant les tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning/.test(args[0]) ||
      /Not implemented/.test(args[0]) ||
      /Invalid prop/.test(args[0])
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (/Warning/.test(args[0])) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}); 