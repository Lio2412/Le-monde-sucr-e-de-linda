import axios from 'axios';
import { authService } from '@/services/authService';
import { performance } from 'perf_hooks';
import type { LoginData, RegisterData, AuthResponse, AuthService } from '@/types/auth';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock du service d'authentification
jest.mock('@/services/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn(),
    register: jest.fn(),
  },
}));

describe('Tests de Performance - Authentification', () => {
  const SEUILS = {
    LOGIN: 200, // ms
    REGISTER: 300, // ms
    GET_ME: 100 // ms
  };

  const NOMBRE_REQUETES = 10;
  const testUser: LoginData & Partial<RegisterData> = {
    email: 'test@example.com',
    password: 'Password123!',
    nom: 'Doe',
    prenom: 'John',
    pseudo: 'johndoe'
  };

  const mesureTempsExecution = async (fn: () => Promise<any>) => {
    const debut = performance.now();
    await fn();
    return performance.now() - debut;
  };

  const calculerStatistiques = (temps: number[]) => {
    const moyenne = temps.reduce((a, b) => a + b) / temps.length;
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    return { moyenne, min, max };
  };

  describe('Login', () => {
    it(`devrait répondre en moins de ${SEUILS.LOGIN}ms`, async () => {
      const temps: number[] = [];

      for (let i = 0; i < NOMBRE_REQUETES; i++) {
        const duree = await mesureTempsExecution(() => 
          authService.login({
            email: testUser.email,
            password: testUser.password
          })
        );
        temps.push(duree);
      }

      const { moyenne, min, max } = calculerStatistiques(temps);
      
      console.log(`Login - Moyenne: ${moyenne.toFixed(2)}ms, Min: ${min.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);
      expect(moyenne).toBeLessThan(SEUILS.LOGIN);
    });
  });

  describe('Register', () => {
    it(`devrait répondre en moins de ${SEUILS.REGISTER}ms`, async () => {
      const temps: number[] = [];

      for (let i = 0; i < NOMBRE_REQUETES; i++) {
        const email = `test${i}@example.com`;
        const registerData: RegisterData = {
          email,
          password: testUser.password,
          nom: testUser.nom!,
          prenom: testUser.prenom!,
          pseudo: `${testUser.pseudo}${i}`
        };

        const duree = await mesureTempsExecution(() => 
          authService.register(registerData)
        );
        temps.push(duree);
      }

      const { moyenne, min, max } = calculerStatistiques(temps);
      
      console.log(`Register - Moyenne: ${moyenne.toFixed(2)}ms, Min: ${min.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);
      expect(moyenne).toBeLessThan(SEUILS.REGISTER);
    });
  });

  describe('GetMe', () => {
    let token: string;

    beforeAll(async () => {
      const response = await authService.login({
        email: testUser.email,
        password: testUser.password
      });
      token = response.data?.token ?? '';
      if (!token) throw new Error('Token non obtenu lors de la connexion');
    });

    it(`devrait répondre en moins de ${SEUILS.GET_ME}ms`, async () => {
      const temps: number[] = [];

      for (let i = 0; i < NOMBRE_REQUETES; i++) {
        const duree = await mesureTempsExecution(() => 
          authService.getMe(token)
        );
        temps.push(duree);
      }

      const { moyenne, min, max } = calculerStatistiques(temps);
      
      console.log(`GetMe - Moyenne: ${moyenne.toFixed(2)}ms, Min: ${min.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);
      expect(moyenne).toBeLessThan(SEUILS.GET_ME);
    });

    it('devrait maintenir les performances sous charge croissante', async () => {
      const charges = [5, 10, 15, 20];
      
      for (const charge of charges) {
        const temps: number[] = [];
        const promesses = Array(charge).fill(0).map(() => 
          mesureTempsExecution(() => authService.getMe(token))
        );

        const resultats = await Promise.all(promesses);
        temps.push(...resultats);

        const { moyenne } = calculerStatistiques(temps);
        console.log(`GetMe (${charge} requêtes simultanées) - Moyenne: ${moyenne.toFixed(2)}ms`);
        expect(moyenne).toBeLessThan(SEUILS.GET_ME * 1.5); // Tolérance de 50% sous charge
      }
    });
  });

  describe('Cache', () => {
    it('devrait améliorer les temps de réponse pour les requêtes répétées', async () => {
      const token = 'test-token';
      const tempsInitial = await mesureTempsExecution(() => 
        authService.getMe(token)
      );

      const tempsCached = await mesureTempsExecution(() => 
        authService.getMe(token)
      );

      console.log(`GetMe - Initial: ${tempsInitial.toFixed(2)}ms, Cached: ${tempsCached.toFixed(2)}ms`);
      expect(tempsCached).toBeLessThan(tempsInitial);
    });
  });
});

describe('Tests de Performance useAuth', () => {
  const mockUser = {
    id: '1',
    email: 'test@test.com',
    nom: 'Test',
    prenom: 'User',
    pseudo: 'testuser',
    roles: [{ role: { nom: 'user', description: 'Utilisateur standard' } }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait se connecter en moins de 100ms', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: 'fake-token',
      },
    });

    const { result } = renderHook(() => useAuth());
    const startTime = performance.now();

    await act(async () => {
      await result.current.login({
        email: 'test@test.com',
        password: 'password123',
      });
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
    expect(result.current.user).toEqual(mockUser);
  });

  it('devrait vérifier l\'authentification en moins de 50ms', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getMe as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
      },
    });

    const startTime = performance.now();
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      // Attendre que useEffect soit exécuté
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(50);
    expect(result.current.user).toEqual(mockUser);
  });

  it('devrait s\'inscrire en moins de 150ms', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: 'fake-token',
      },
    });

    const { result } = renderHook(() => useAuth());
    const startTime = performance.now();

    await act(async () => {
      await result.current.register({
        email: 'test@test.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'testuser',
      });
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(150);
    expect(result.current.user).toEqual(mockUser);
  });

  it('devrait se déconnecter en moins de 50ms', async () => {
    const { result } = renderHook(() => useAuth());
    const startTime = performance.now();

    await act(async () => {
      await result.current.logout();
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(50);
    expect(result.current.user).toBeNull();
  });
}); 