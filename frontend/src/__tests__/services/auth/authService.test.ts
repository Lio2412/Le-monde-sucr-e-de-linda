import axios from 'axios';
import { authService } from '../../../services/authService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key],
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthService', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'test@test.com',
      password: 'password123',
    };

    const mockSuccessResponse = {
      data: {
        data: {
          user: {
            id: '1',
            email: 'test@test.com',
            nom: 'Test',
            prenom: 'User',
            pseudo: 'testuser',
            roles: [{ role: { nom: 'user', description: 'Utilisateur standard' } }],
          },
          token: 'mock-token',
        },
        message: 'Connexion réussie',
      },
    };

    it('devrait gérer une connexion réussie', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockSuccessResponse);

      const response = await authService.login(mockCredentials);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        mockCredentials,
        expect.any(Object)
      );
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(response.success).toBe(true);
      expect(response.data?.token).toBe('mock-token');
    });

    it('devrait gérer une erreur de connexion', async () => {
      const errorMessage = 'Email ou mot de passe incorrect';
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
        isAxiosError: true,
      });

      await expect(authService.login(mockCredentials)).rejects.toThrow(errorMessage);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('register', () => {
    const mockRegisterData = {
      email: 'test@test.com',
      password: 'password123',
      nom: 'Test',
      prenom: 'User',
      pseudo: 'testuser',
    };

    const mockSuccessResponse = {
      data: {
        data: {
          user: {
            id: '1',
            ...mockRegisterData,
            roles: [{ role: { nom: 'user', description: 'Utilisateur standard' } }],
          },
          token: 'mock-token',
        },
        message: 'Inscription réussie',
      },
    };

    it('devrait gérer une inscription réussie', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockSuccessResponse);

      const response = await authService.register(mockRegisterData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        mockRegisterData,
        expect.any(Object)
      );
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(response.success).toBe(true);
      expect(response.data?.token).toBe('mock-token');
    });

    it('devrait gérer une erreur d\'inscription', async () => {
      const errorMessage = 'Email déjà utilisé';
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
        isAxiosError: true,
      });

      await expect(authService.register(mockRegisterData)).rejects.toThrow(errorMessage);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    const mockUserData = {
      id: '1',
      email: 'test@test.com',
      nom: 'Test',
      prenom: 'User',
      pseudo: 'testuser',
      roles: [{ role: { nom: 'user', description: 'Utilisateur standard' } }],
    };

    it('devrait récupérer les informations de l\'utilisateur connecté', async () => {
      localStorage.setItem('token', 'mock-token');
      mockedAxios.get.mockResolvedValueOnce({ data: { data: mockUserData } });

      const response = await authService.getCurrentUser();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer mock-token' },
        })
      );
      expect(response.success).toBe(true);
      expect(response.data?.user).toEqual(mockUserData);
    });

    it('devrait gérer l\'absence de token', async () => {
      await expect(authService.getCurrentUser()).rejects.toThrow('Non authentifié');
    });

    it('devrait gérer une erreur de récupération du profil', async () => {
      localStorage.setItem('token', 'mock-token');
      const errorMessage = 'Token invalide';
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
        isAxiosError: true,
      });

      await expect(authService.getCurrentUser()).rejects.toThrow(errorMessage);
    });
  });

  describe('logout', () => {
    it('devrait supprimer le token du localStorage', () => {
      localStorage.setItem('token', 'mock-token');
      authService.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('devrait retourner true si un token est présent', () => {
      localStorage.setItem('token', 'mock-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('devrait retourner false si aucun token n\'est présent', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
}); 