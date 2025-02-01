import axios from 'axios';
import { authService } from '@/services/authService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Tests d\'intégration API Auth', () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Appels API d\'authentification', () => {
    const mockCredentials = {
      email: 'test@test.com',
      password: 'Password123!',
    };

    const mockRegistrationData = {
      email: 'nouveau@test.com',
      password: 'Password123!',
      nom: 'Nouveau',
      prenom: 'Utilisateur',
      pseudo: 'nouveauuser',
    };

    const mockUser = {
      id: '1',
      email: 'test@test.com',
      nom: 'Test',
      prenom: 'User',
      pseudo: 'testuser',
      roles: [{ role: { nom: 'USER', description: 'Utilisateur standard' } }],
    };

    describe('Login API', () => {
      it('devrait envoyer une requête POST correcte à /auth/login', async () => {
        // Configuration du mock de réponse
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              user: mockUser,
              token: 'mock-token',
            },
            message: 'Connexion réussie',
          },
        });

        // Appel au service
        const response = await authService.login(mockCredentials);

        // Vérifications
        expect(mockedAxios.post).toHaveBeenCalledWith(
          `${API_URL}/auth/login`,
          mockCredentials,
          expect.any(Object)
        );
        expect(response.success).toBe(true);
        expect(response.data?.token).toBe('mock-token');
        expect(localStorage.getItem('token')).toBe('mock-token');
      });

      it('devrait gérer correctement les erreurs de connexion', async () => {
        // Configuration du mock pour une erreur
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: {
              success: false,
              message: 'Email ou mot de passe incorrect',
            },
          },
          isAxiosError: true,
        });

        // Vérification de la gestion d'erreur
        await expect(authService.login(mockCredentials)).rejects.toThrow(
          'Email ou mot de passe incorrect'
        );
        expect(localStorage.getItem('token')).toBeNull();
      });

      it('devrait gérer les erreurs réseau', async () => {
        // Configuration du mock pour une erreur réseau
        mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

        // Vérification de la gestion d'erreur
        await expect(authService.login(mockCredentials)).rejects.toThrow('Network Error');
        expect(localStorage.getItem('token')).toBeNull();
      });
    });

    describe('Register API', () => {
      it('devrait envoyer une requête POST correcte à /auth/register', async () => {
        // Configuration du mock de réponse
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              user: {
                ...mockUser,
                email: mockRegistrationData.email,
              },
              token: 'new-user-token',
            },
            message: 'Inscription réussie',
          },
        });

        // Appel au service
        const response = await authService.register(mockRegistrationData);

        // Vérifications
        expect(mockedAxios.post).toHaveBeenCalledWith(
          `${API_URL}/auth/register`,
          mockRegistrationData,
          expect.any(Object)
        );
        expect(response.success).toBe(true);
        expect(response.data?.token).toBe('new-user-token');
        expect(localStorage.getItem('token')).toBe('new-user-token');
      });

      it('devrait gérer les erreurs de validation serveur', async () => {
        // Configuration du mock pour une erreur de validation
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: {
              success: false,
              message: 'Email déjà utilisé',
            },
          },
          isAxiosError: true,
        });

        // Vérification de la gestion d'erreur
        await expect(authService.register(mockRegistrationData)).rejects.toThrow(
          'Email déjà utilisé'
        );
        expect(localStorage.getItem('token')).toBeNull();
      });
    });

    describe('GetCurrentUser API', () => {
      it('devrait récupérer les informations de l\'utilisateur avec un token valide', async () => {
        // Configuration initiale
        localStorage.setItem('token', 'valid-token');

        // Configuration du mock de réponse
        mockedAxios.get.mockResolvedValueOnce({
          data: {
            success: true,
            data: mockUser,
          },
        });

        // Appel au service
        const response = await authService.getCurrentUser();

        // Vérifications
        expect(mockedAxios.get).toHaveBeenCalledWith(
          `${API_URL}/auth/me`,
          expect.objectContaining({
            headers: { Authorization: 'Bearer valid-token' },
          })
        );
        expect(response.success).toBe(true);
        expect(response.data?.user).toEqual(mockUser);
      });

      it('devrait gérer un token invalide', async () => {
        // Configuration initiale
        localStorage.setItem('token', 'invalid-token');

        // Configuration du mock pour une erreur d'authentification
        mockedAxios.get.mockRejectedValueOnce({
          response: {
            data: {
              success: false,
              message: 'Token invalide ou expiré',
            },
          },
          isAxiosError: true,
        });

        // Vérification de la gestion d'erreur
        await expect(authService.getCurrentUser()).rejects.toThrow(
          'Token invalide ou expiré'
        );
      });

      it('devrait gérer l\'absence de token', async () => {
        // Vérification de la gestion d'erreur sans token
        await expect(authService.getCurrentUser()).rejects.toThrow('Non authentifié');
      });
    });

    describe('Gestion des timeouts et retry', () => {
      it('devrait gérer les timeouts des requêtes', async () => {
        // Configuration du mock pour simuler un timeout
        mockedAxios.post.mockRejectedValueOnce({
          code: 'ECONNABORTED',
          message: 'timeout of 5000ms exceeded',
          isAxiosError: true,
        });

        // Vérification de la gestion du timeout
        await expect(authService.login(mockCredentials)).rejects.toThrow(
          'La requête a expiré'
        );
      });

      it('devrait réessayer la requête en cas d\'erreur temporaire', async () => {
        // Premier appel échoue
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            status: 503,
            data: {
              message: 'Service temporairement indisponible',
            },
          },
          isAxiosError: true,
        });

        // Deuxième appel réussit
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              user: mockUser,
              token: 'mock-token',
            },
          },
        });

        // Appel au service
        const response = await authService.login(mockCredentials);

        // Vérifications
        expect(mockedAxios.post).toHaveBeenCalledTimes(2);
        expect(response.success).toBe(true);
      });
    });

    describe('Gestion des en-têtes et du cache', () => {
      it('devrait inclure les en-têtes appropriés dans les requêtes', async () => {
        // Configuration du mock de réponse
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              user: mockUser,
              token: 'mock-token',
            },
          },
        });

        // Appel au service
        await authService.login(mockCredentials);

        // Vérification des en-têtes
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });

      it('devrait gérer correctement le cache des réponses', async () => {
        // Configuration du mock de réponse avec en-têtes de cache
        mockedAxios.get.mockResolvedValueOnce({
          data: {
            success: true,
            data: mockUser,
          },
          headers: {
            'cache-control': 'max-age=3600',
            etag: '"abc123"',
          },
        });

        // Premier appel
        await authService.getCurrentUser();

        // Deuxième appel avec ETag
        mockedAxios.get.mockResolvedValueOnce({
          status: 304,
          data: null,
        });

        // Vérification que le deuxième appel inclut l'ETag
        await authService.getCurrentUser();
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'If-None-Match': '"abc123"',
            }),
          })
        );
      });
    });
  });
}); 