import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import * as authService from '@/services/authService';
import { renderWithProviders } from '../../setup/test-utils';

// Mock du service d'authentification
jest.mock('@/services/authService');

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait initialiser avec les valeurs par défaut', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('devrait gérer une connexion réussie', async () => {
    const mockUser = { id: 1, email: 'test@test.com', role: 'USER' };
    (authService.login as jest.Mock).mockResolvedValue({ success: true, data: { user: mockUser } });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('devrait gérer l\'échec de connexion', async () => {
    const errorMessage = 'Invalid credentials';
    (authService.login as jest.Mock).mockResolvedValue({ success: false, error: errorMessage });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.login('test@test.com', 'wrong-password');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });

  it('devrait gérer la déconnexion', async () => {
    (authService.logout as jest.Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('devrait vérifier correctement les rôles', async () => {
    const mockUser = { id: 1, email: 'admin@test.com', role: 'ADMIN' };
    (authService.login as jest.Mock).mockResolvedValue({ success: true, data: { user: mockUser } });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.login('admin@test.com', 'password');
    });

    expect(result.current.hasRole('ADMIN')).toBe(true);
    expect(result.current.hasRole('USER')).toBe(false);
  });

  it('devrait gérer une erreur réseau lors de la connexion', async () => {
    const networkError = new Error('Network error');
    (authService.login as jest.Mock).mockRejectedValue(networkError);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Une erreur est survenue lors de la connexion');
    expect(result.current.loading).toBe(false);
  });

  it('devrait gérer une inscription réussie', async () => {
    const mockUser = { id: 1, email: 'new@test.com', role: 'USER' };
    (authService.register as jest.Mock).mockResolvedValue({ success: true, data: { user: mockUser } });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.register({
        email: 'new@test.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User'
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('devrait gérer un échec d\'inscription', async () => {
    const errorMessage = 'Email already exists';
    (authService.register as jest.Mock).mockResolvedValue({ success: false, error: errorMessage });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.register({
        email: 'existing@test.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User'
      });
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });

  it('devrait gérer la redirection admin après connexion', async () => {
    const mockAdminUser = { id: 1, email: 'admin@test.com', role: 'ADMIN' };
    (authService.login as jest.Mock).mockResolvedValue({ success: true, data: { user: mockAdminUser } });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.login('admin@test.com', 'password');
    });

    expect(result.current.user).toEqual(mockAdminUser);
    // Vérifier que la redirection a été appelée avec le bon chemin
    const router = require('next/navigation').useRouter();
    expect(router.push).toHaveBeenCalledWith('/admin');
  });

  it('devrait vérifier l\'authentification au chargement', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getMe as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: {
          id: 1,
          email: 'test@test.com',
          role: 'USER'
        }
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    // Attendre que le hook effectue la vérification initiale
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual({
      id: 1,
      email: 'test@test.com',
      role: 'USER'
    });
    expect(result.current.loading).toBe(false);
  });
}); 