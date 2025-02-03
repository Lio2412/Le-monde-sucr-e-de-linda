import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock des services
jest.mock('@/services/authService');

// Types pour les mocks
interface MockUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

const mockUser: MockUser = {
  id: 1,
  email: 'test@test.com',
  nom: 'Test',
  prenom: 'User',
  role: 'USER'
};

const mockAdminUser: MockUser = {
  id: 2,
  email: 'admin@test.com',
  nom: 'Admin',
  prenom: 'User',
  role: 'ADMIN'
};

const renderWithProviders = (children: React.ReactNode) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('devrait gérer le chargement initial', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('devrait gérer une connexion réussie', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ 
      success: true, 
      data: { 
        user: mockUser,
        token: 'fake-token'
      } 
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.login({
        email: 'test@test.com',
        password: 'password'
      });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('devrait gérer une erreur de connexion', async () => {
    const errorMessage = 'Identifiants invalides';
    (authService.login as jest.Mock).mockResolvedValue({ 
      success: false, 
      error: errorMessage 
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.login({
        email: 'test@test.com',
        password: 'wrong-password'
      });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('devrait gérer la déconnexion', async () => {
    (authService.logout as jest.Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    // Simuler un utilisateur connecté
    (result.current as any).user = mockUser;
    (result.current as any).isAuthenticated = true;

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('devrait vérifier les rôles correctement', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ 
      success: true, 
      data: { 
        user: mockAdminUser,
        token: 'fake-token'
      } 
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.login({
        email: 'admin@test.com',
        password: 'password'
      });
    });

    expect(result.current.user?.role).toBe('ADMIN');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('devrait gérer les erreurs réseau', async () => {
    const networkError = new Error('Erreur réseau');
    (authService.login as jest.Mock).mockRejectedValue(networkError);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.login({
        email: 'test@test.com',
        password: 'password'
      });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Erreur de connexion au serveur');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('devrait gérer une inscription réussie', async () => {
    (authService.register as jest.Mock).mockResolvedValue({ 
      success: true, 
      data: { 
        user: mockUser,
        token: 'fake-token'
      } 
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    const registerData = {
      email: 'test@test.com',
      password: 'password123',
      nom: 'Test',
      prenom: 'User',
      pseudo: 'testuser'
    };

    await act(async () => {
      await result.current.register(registerData);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('devrait gérer une erreur d\'inscription', async () => {
    const errorMessage = 'Email déjà utilisé';
    (authService.register as jest.Mock).mockResolvedValue({ 
      success: false, 
      error: errorMessage 
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    const registerData = {
      email: 'test@test.com',
      password: 'password123',
      nom: 'Test',
      prenom: 'User',
      pseudo: 'testuser'
    };

    await act(async () => {
      await result.current.register(registerData);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('devrait vérifier l\'authentification au chargement', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getMe as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: mockUser
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await act(async () => {
      await result.current.checkAuth();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });
}); 