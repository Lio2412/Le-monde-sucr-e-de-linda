import '@testing-library/jest-dom';

// Configuration globale pour les tests
beforeAll(() => {
  // Setup global avant tous les tests
  // Configuration des variables d'environnement de test de manière sécurisée
  Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
  Object.defineProperty(process.env, 'JWT_SECRET', { value: 'test-secret' });
  Object.defineProperty(process.env, 'DATABASE_URL', { value: 'postgresql://test:test@localhost:5432/test_db' });
});

afterAll(() => {
  // Cleanup global après tous les tests
});

// Reset les mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

// Configuration des timeouts globaux
jest.setTimeout(10000); // 10 secondes

// Désactiver les logs pendant les tests
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn(); 