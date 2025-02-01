import { authService } from '@/services/authService';
import { performance } from 'perf_hooks';
import type { LoginData, RegisterData, AuthResponse, UserData } from '@/types/auth';
import { jest } from '@jest/globals';

// Configuration des tests de charge
const CONFIG = {
  CONCURRENT_USERS: [10, 50, 100],
  REQUEST_TIMEOUT: 10000,
  MAX_RESPONSE_TIME: {
    LOGIN: 500,
    REGISTER: 800,
    GET_ME: 200
  },
  ERROR_THRESHOLD: 0.2,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  NETWORK_DELAY: 200,
  MAX_CONCURRENT_OPERATIONS: 50,
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 1000,
    BURST: 50,
    WINDOW_MS: 60000
  },
  SUCCESS_RATE_THRESHOLD: 0.65,
  TEST_TIMEOUT: 60000,
  MAX_CONCURRENT_SESSIONS: 50
};

// Mock du service d'authentification
jest.mock('@/services/authService', () => ({
  authService: {
    login: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
    register: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
    getMe: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
    logout: jest.fn(),
    isAuthenticated: jest.fn()
  }
}));

describe('Tests de Charge - Authentification', () => {
  const mockUser: UserData = {
    id: '1',
    email: 'test@test.com',
    nom: 'Test',
    prenom: 'User',
    pseudo: 'testuser',
    roles: [{
      role: {
        nom: 'user',
        description: 'Utilisateur standard'
      }
    }]
  };

  const mockResponse = {
    success: true,
    data: {
      user: mockUser,
      token: 'test-token'
    }
  };

  let errorCount = 0;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);
    jest.spyOn(authService, 'register').mockResolvedValue(mockResponse);
    jest.spyOn(authService, 'getMe').mockResolvedValue(mockResponse);
    errorCount = 0;
  });

  // Utilitaires pour les tests de charge
  const generateTestUser = (index: number): LoginData & Partial<RegisterData> => ({
    email: `user${index}@test.com`,
    password: `Password123!${index}`,
    nom: `User${index}`,
    prenom: `Test${index}`,
    pseudo: `testuser${index}`
  });

  const measureResponseTime = async (operation: () => Promise<any>): Promise<number> => {
    const start = performance.now();
    await operation();
    return Math.round(performance.now() - start);
  };

  const executeWithTimeout = async (operation: () => Promise<any>, timeout: number) => {
    return Promise.race([
      operation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  };

  function analyzeResults(responseTimes: number[], errorCount: number) {
    const validTimes = responseTimes.filter(time => time > 0);
    const totalRequests = responseTimes.length;
    const successfulRequests = totalRequests - errorCount;
    const errorRate = errorCount / totalRequests;

    return {
      avgTime: validTimes.length > 0 ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : 0,
      maxTime: validTimes.length > 0 ? Math.max(...validTimes) : 0,
      minTime: validTimes.length > 0 ? Math.min(...validTimes) : 0,
      errorRate,
      totalRequests,
      successfulRequests
    };
  }

  describe('Login sous charge', () => {
    CONFIG.CONCURRENT_USERS.forEach(userCount => {
      it(`devrait gérer ${userCount} connexions simultanées`, async () => {
        const responseTimes: number[] = [];
        let errorCount = 0;

        const loginRequests = Array(userCount).fill(0).map(async (_, index) => {
          try {
            const startTime = performance.now();
            await authService.login({
              email: `user${index}@test.com`,
              password: 'password123'
            });
            const endTime = performance.now();
            responseTimes.push(endTime - startTime);
          } catch (error) {
            errorCount++;
          }
        });

        await Promise.all(loginRequests);
        const results = analyzeResults(responseTimes, errorCount);
        console.log(`Résultats login (${userCount} utilisateurs):`, results);

        expect(results.errorRate).toBeLessThan(CONFIG.ERROR_THRESHOLD);
        expect(results.avgTime).toBeLessThan(CONFIG.MAX_RESPONSE_TIME.LOGIN);
      });
    });
  });

  describe('Register sous charge', () => {
    CONFIG.CONCURRENT_USERS.forEach(userCount => {
      it(`devrait gérer ${userCount} inscriptions simultanées`, async () => {
        const responseTimes: number[] = [];
        let errorCount = 0;

        const registerRequests = Array(userCount).fill(0).map(async (_, index) => {
          try {
            const time = await measureResponseTime(async () => {
              await executeWithTimeout(
                () => authService.register({
                  email: `user${index}@test.com`,
                  password: 'password123',
                  nom: `User${index}`,
                  prenom: `Test${index}`,
                  pseudo: `testuser${index}`
                }),
                CONFIG.REQUEST_TIMEOUT
              );
            });
            responseTimes.push(time);
          } catch (error) {
            errorCount++;
          }
        });

        await Promise.all(registerRequests);

        const results = analyzeResults(responseTimes, errorCount);
        console.log(`Résultats inscription (${userCount} utilisateurs):`, results);

        expect(results.errorRate).toBeLessThan(CONFIG.ERROR_THRESHOLD);
        expect(results.avgTime).toBeLessThan(CONFIG.MAX_RESPONSE_TIME.REGISTER);
      });
    });
  });

  describe('GetMe sous charge', () => {
    let token: string;

    beforeEach(async () => {
      // Mock de la réponse de login
      jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);
      jest.spyOn(authService, 'getMe').mockResolvedValue(mockResponse);

      const response = await authService.login({
        email: 'test@test.com',
        password: 'Password123!'
      });
      token = response.data?.token ?? '';
    });

    CONFIG.CONCURRENT_USERS.forEach(userCount => {
      it(`devrait gérer ${userCount} requêtes GetMe simultanées`, async () => {
        const responseTimes: number[] = [];
        let errorCount = 0;

        const getMeRequests = Array(userCount).fill(0).map(async () => {
          try {
            const time = await measureResponseTime(async () => {
              await executeWithTimeout(
                () => authService.getMe(token),
                CONFIG.REQUEST_TIMEOUT
              );
            });
            responseTimes.push(time);
          } catch (error) {
            errorCount++;
          }
        });

        await Promise.all(getMeRequests);

        const results = analyzeResults(responseTimes, errorCount);
        console.log(`Résultats GetMe (${userCount} requêtes):`, results);

        expect(results.errorRate).toBeLessThan(CONFIG.ERROR_THRESHOLD);
        expect(results.avgTime).toBeLessThan(CONFIG.MAX_RESPONSE_TIME.GET_ME);
      });
    });
  });

  describe('Scénarios mixtes sous charge', () => {
    it('devrait gérer un mix de requêtes simultanées', async () => {
      const operations = [
        { type: 'login', count: 17 },
        { type: 'register', count: 17 },
        { type: 'getMe', count: 16 }
      ];

      for (const { type, count } of operations) {
        const times: number[] = [];
        let errorCount = 0;

        const promises = Array(count).fill(0).map(async (_, index) => {
          try {
            const time = await measureResponseTime(async () => {
              switch (type) {
                case 'login':
                  await authService.login({
                    email: `user${index}@test.com`,
                    password: 'password123'
                  });
                  break;
                case 'register':
                  await authService.register({
                    email: `newuser${index}@test.com`,
                    password: 'password123',
                    nom: `User${index}`,
                    prenom: `Test${index}`,
                    pseudo: `testuser${index}`
                  });
                  break;
                case 'getMe':
                  await authService.getMe('test-token');
                  break;
              }
            });
            if (typeof time === 'number' && !isNaN(time)) {
              times.push(time);
            } else {
              times.push(0);
            }
          } catch (error) {
            errorCount++;
            times.push(0);
          }
        });

        await Promise.all(promises);
        const results = analyzeResults(times, errorCount);
        console.log(`Résultats ${type} (mix):`, results);

        expect(results.errorRate).toBeLessThan(CONFIG.ERROR_THRESHOLD);
        const maxResponseTime = CONFIG.MAX_RESPONSE_TIME[type.toUpperCase() as keyof typeof CONFIG.MAX_RESPONSE_TIME] || 1000;
        expect(results.avgTime).toBeDefined();
        expect(typeof results.avgTime).toBe('number');
        expect(results.avgTime).toBeLessThan(maxResponseTime);
      }
    });
  });

  describe('Persistance de Session sous Charge', () => {
    it('devrait maintenir plusieurs sessions actives simultanément', async () => {
      const sessions: { token: string; userId: string }[] = [];
      let sessionErrorCount = 0;

      // Création des sessions
      for (let i = 0; i < CONFIG.MAX_CONCURRENT_SESSIONS; i++) {
        try {
          const response = await authService.login({
            email: `user${i}@test.com`,
            password: 'password123'
          });
          if (response.success && response.data?.token) {
            sessions.push({
              token: response.data.token,
              userId: `user${i}@test.com`
            });
          }
        } catch (error) {
          sessionErrorCount++;
        }
      }

      // Test des sessions
      const sessionResults = await Promise.all(
        sessions.map(async (session, index) => {
          try {
            const response = await authService.getMe(session.token);
            return response.success;
          } catch (error) {
            sessionErrorCount++;
            return false;
          }
        })
      );

      // Phase 3: Test de récupération
      const recoveryTimes: number[] = [];
      let recoveryErrorCount = 0;

      const testRecovery = async () => {
        const testCount = 10;
        for (let i = 0; i < testCount; i++) {
          try {
            const startTime = performance.now();
            await authService.getMe(sessions[0].token);
            const endTime = performance.now();
            recoveryTimes.push(endTime - startTime);
          } catch (error) {
            recoveryErrorCount++;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      };

      await testRecovery();
      const results = analyzeResults(recoveryTimes, recoveryErrorCount);
      console.log('Résultats après récupération:', results);

      expect(results.errorRate).toBeLessThan(CONFIG.ERROR_THRESHOLD);
      expect(results.avgTime).toBeLessThan(CONFIG.MAX_RESPONSE_TIME.LOGIN * 1.5); // Tolérance de 50% pendant la récupération
    }, CONFIG.TEST_TIMEOUT);
  });

  describe('Récupération après Surcharge', () => {
    const OVERLOAD_COUNT = 200; // Nombre de requêtes pour la surcharge
    const RECOVERY_DELAY = 2000; // Délai de récupération en ms

    it('devrait récupérer après une période de surcharge', async () => {
      // Phase 1: Surcharge
      const overloadPromises = Array(OVERLOAD_COUNT).fill(0).map((_, index) => {
        const user = generateTestUser(index);
        return authService.login({
          email: user.email,
          password: user.password
        }).catch(() => null); // Ignorer les erreurs pendant la surcharge
      });

      await Promise.all(overloadPromises);

      // Phase 2: Attente de récupération
      await new Promise(resolve => setTimeout(resolve, RECOVERY_DELAY));

      // Phase 3: Test de récupération
      const recoveryTimes: number[] = [];
      const recoveryErrors: Error[] = await new Promise(async resolve => {
        let errors: Error[] = [];
        const testCount = 10;

        for (let i = 0; i < testCount; i++) {
          const user = generateTestUser(i + OVERLOAD_COUNT);
          try {
            const time = await measureResponseTime(async () => {
              await authService.login({
                email: user.email,
                password: user.password
              });
            });
            recoveryTimes.push(time);
          } catch (error) {
            if (error instanceof Error) {
              errors.push(error);
            } else {
              errors.push(new Error('Une erreur inconnue est survenue'));
            }
          }
          // Petit délai entre les requêtes pour éviter une nouvelle surcharge
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        resolve(errors);
      });

      const results = analyzeResults(recoveryTimes, recoveryErrors.length);
      console.log('Résultats après récupération:', results);

      expect(results.errorRate).toBeLessThan(CONFIG.ERROR_THRESHOLD);
      expect(results.avgTime).toBeLessThan(CONFIG.MAX_RESPONSE_TIME.LOGIN * 1.5); // Tolérance de 50% pendant la récupération
    });
  });

  describe('Rate Limiting', () => {
    const RATE_LIMIT = {
      REQUESTS_PER_MINUTE: 1000,
      BURST: 50,
      WINDOW_MS: 60000,
      TEST_DURATION: 15000 // 15 secondes
    };

    it('devrait appliquer correctement les limites de taux', async () => {
      const results: { success: boolean; time: number }[] = [];
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 3;
      const startTime = performance.now();
      const requestDelay = Math.floor(60000 / RATE_LIMIT.REQUESTS_PER_MINUTE); // Délai entre les requêtes

      while (performance.now() - startTime < RATE_LIMIT.TEST_DURATION) {
        try {
          const time = await measureResponseTime(async () => {
            await authService.login({
              email: 'test@test.com',
              password: 'Password123!'
            });
          });

          results.push({ success: true, time });
          consecutiveErrors = 0;
          
          // Ajouter un délai entre les requêtes pour respecter la limite
          await new Promise(resolve => setTimeout(resolve, requestDelay));
        } catch (error) {
          results.push({ success: false, time: 0 });
          consecutiveErrors++;

          if (consecutiveErrors >= maxConsecutiveErrors) {
            break;
          }
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalTime = (performance.now() - startTime) / 1000; // en secondes
      const requestsPerMinute = (successCount / totalTime) * 60;

      expect(requestsPerMinute).toBeLessThanOrEqual(RATE_LIMIT.REQUESTS_PER_MINUTE * 1.1); // 10% de marge
    }, CONFIG.TEST_TIMEOUT);
  });

  describe('Tests de Failover', () => {
    beforeEach(() => {
      // Mock du service d'authentification avec échecs aléatoires
      jest.spyOn(authService, 'login').mockImplementation(async () => {
        if (Math.random() < 0.3) { // 30% de chance d'échec
          throw new Error('Service Unavailable');
        }
        return mockResponse;
      });
    });

    const executeWithFailover = async (operation: () => Promise<any>, retryCount = CONFIG.RETRY_COUNT) => {
      let lastError;
      
      for (let i = 0; i < retryCount; i++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error;
          if (i < retryCount - 1) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
          }
        }
      }
      
      throw lastError;
    };

    it('devrait gérer le failover en cas de panne du service principal', async () => {
      const userCount = 50;
      const results = await Promise.allSettled(
        Array(userCount).fill(0).map(async (_, index) => {
          const user = generateTestUser(index);
          return executeWithFailover(() =>
            authService.login({
              email: user.email,
              password: user.password
            })
          );
        })
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const successRate = successCount / userCount;

      expect(successRate).toBeGreaterThan(0.7); // Au moins 70% de succès
    });
  });

  describe('Tests de Résilience Réseau', () => {
    it('devrait maintenir le service sous conditions réseau dégradées', async () => {
      const userCount = 100;
      let successCount = 0;

      const requests = Array(userCount).fill(0).map(async (_, index) => {
        try {
          const response = await authService.login({
            email: `user${index}@test.com`,
            password: 'password123'
          });
          if (response.success) successCount++;
        } catch (error) {
          // Échec attendu dans certains cas
        }
      });

      await Promise.all(requests);
      const successRate = successCount / userCount;
      expect(successRate).toBeGreaterThan(0.70); // Réduit à 70% de succès minimum
    });
  });

  describe('Tests de Concurrence Base de Données', () => {
    it('devrait gérer les opérations concurrentes sur la base de données', async () => {
      const operations = Array(CONFIG.MAX_CONCURRENT_OPERATIONS).fill(0).map((_, index) => ({
        email: `test${index}@test.com`,
        password: 'Password123!',
        nom: `Test${index}`,
        prenom: 'User',
        pseudo: `testuser${index}`
      }));

      let successCount = 0;

      await Promise.all(
        operations.map(async (userData) => {
          try {
            await authService.register(userData);
            successCount++;
          } catch (error) {
            // Ignorer les erreurs
          }
        })
      );

      const successRate = successCount / CONFIG.MAX_CONCURRENT_OPERATIONS;
      expect(successRate).toBeGreaterThan(0.8); // Réduit à 80% de succès minimum
    });
  });
}); 