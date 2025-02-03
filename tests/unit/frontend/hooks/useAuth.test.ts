import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../../../frontend/src/hooks/useAuth';
import axios from 'axios';
import { describe, it, expect, vi } from 'vitest';

vi.mock('axios');
const mockAxios = axios as any;

describe('useAuth', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    nom: 'Test User'
  };

  const mockToken = 'mock_token';

  beforeEach(() => {
    // Nettoyer le localStorage avant chaque test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      motDePasse: 'Password123!'
    };

    it('devrait connecter l\'utilisateur avec succès', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { token: mockToken, user: mockUser }
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(loginCredentials);
      });

      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('devrait gérer les erreurs de connexion', async () => {
      const errorMessage = 'Email ou mot de passe incorrect';
      mockAxios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(loginCredentials);
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur', async () => {
      // Simuler un utilisateur connecté
      localStorage.setItem('token', mockToken);
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('devrait vérifier l\'authentification avec succès', async () => {
      localStorage.setItem('token', mockToken);
      mockAxios.get.mockResolvedValueOnce({ data: mockUser });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('devrait gérer les erreurs d\'authentification', async () => {
      localStorage.setItem('token', 'invalid_token');
      mockAxios.get.mockRejectedValueOnce({
        response: { data: { message: 'Token invalide' } }
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('ne devrait pas vérifier l\'authentification sans token', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(mockAxios.get).not.toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      motDePasse: 'Password123!',
      nom: 'Test User'
    };

    it('devrait inscrire un nouvel utilisateur avec succès', async () => {
      mockAxios.post.mockResolvedValueOnce({
        data: { message: 'Inscription réussie' }
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register(registerData);
      });

      expect(result.current.error).toBeNull();
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/auth/register',
        registerData
      );
    });

    it('devrait gérer les erreurs d\'inscription', async () => {
      const errorMessage = 'Email déjà utilisé';
      mockAxios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register(registerData);
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });
}); 