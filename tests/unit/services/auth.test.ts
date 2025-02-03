import { adminAuth } from '../../../frontend/src/services/auth';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AdminAuth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'admin@test.com',
      password: 'password123'
    };

    it('devrait retourner un token lors d\'une connexion réussie', async () => {
      const mockResponse = {
        status: 200,
        data: {
          token: 'mock-token'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const response = await adminAuth.login(mockCredentials);

      expect(response.status).toBe(200);
      expect(response.data.token).toBe('mock-token');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/login'),
        mockCredentials
      );
    });

    it('devrait lancer une erreur lors d\'une connexion échouée', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Erreur de connexion'));

      await expect(adminAuth.login(mockCredentials))
        .rejects
        .toThrow('Identifiants invalides');
    });
  });

  describe('validateSession', () => {
    const mockToken = 'mock-token';

    it('devrait valider une session valide', async () => {
      const mockResponse = {
        data: {
          message: 'Session valide'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await adminAuth.validateSession(mockToken);

      expect(result.isValid).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/validate-session'),
        {},
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        })
      );
    });

    it('devrait invalider une session expirée', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Session expirée'));

      const result = await adminAuth.validateSession(mockToken);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Session invalide');
    });
  });

  describe('logout', () => {
    it('devrait se déconnecter avec succès', async () => {
      mockedAxios.post.mockResolvedValueOnce({});

      const result = await adminAuth.logout();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Déconnexion réussie');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/logout')
      );
    });

    it('devrait gérer les erreurs de déconnexion', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Erreur de déconnexion'));

      const result = await adminAuth.logout();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erreur lors de la déconnexion');
    });
  });
}); 