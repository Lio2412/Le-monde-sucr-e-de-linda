import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

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

describe('useAuth Hook', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false);
  });

  it('devrait initialiser avec les valeurs par défaut', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('devrait gérer une connexion réussie', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      nom: 'Test',
      prenom: 'User',
      pseudo: 'testuser',
      roles: [{ role: { nom: 'user', description: 'Utilisateur standard' } }],
    };

    (authService.login as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: 'fake-token',
      },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'password' });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('devrait gérer l\'échec de connexion', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Email ou mot de passe incorrect',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'wrong' });
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Email ou mot de passe incorrect');
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('devrait gérer la déconnexion', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(authService.logout).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/connexion');
  });

  it('devrait vérifier correctement les rôles', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      nom: 'Test',
      prenom: 'User',
      pseudo: 'testuser',
      roles: [{ role: { nom: 'admin', description: 'Administrateur' } }],
    };

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      result.current.setUser(mockUser);
    });

    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('user')).toBe(false);
  });

  it('devrait gérer une erreur réseau lors de la connexion', async () => {
    const networkError = new Error('Erreur réseau');
    (authService.login as jest.Mock).mockRejectedValue(networkError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'password' });
    });

    expect(result.current.error).toBe('Email ou mot de passe incorrect');
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('devrait gérer une inscription réussie', async () => {
    const mockUser = {
      id: '1',
      email: 'nouveau@test.com',
      nom: 'Nouveau',
      prenom: 'User',
      pseudo: 'newuser',
      roles: [{ role: { nom: 'user', description: 'Utilisateur standard' } }],
    };

    (authService.register as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: 'fake-token',
      },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register({
        email: 'nouveau@test.com',
        password: 'password123',
        nom: 'Nouveau',
        prenom: 'User',
        pseudo: 'newuser',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  it('devrait gérer un échec d\'inscription', async () => {
    const errorMessage = 'Email déjà utilisé';
    (authService.register as jest.Mock).mockResolvedValue({
      success: false,
      message: errorMessage,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register({
        email: 'test@test.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'testuser',
      });
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it('devrait gérer la redirection admin après connexion', async () => {
    const mockAdminUser = {
      id: '1',
      email: 'admin@test.com',
      nom: 'Admin',
      prenom: 'User',
      pseudo: 'adminuser',
      roles: [{ role: { nom: 'admin', description: 'Administrateur' } }],
    };

    (authService.login as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: mockAdminUser,
        token: 'fake-token',
      },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'admin@test.com', password: 'password' });
    });

    expect(result.current.user).toEqual(mockAdminUser);
    expect(mockRouter.push).toHaveBeenCalledWith('/admin');
  });

  it('devrait vérifier l\'authentification au chargement', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getMe as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@test.com',
          nom: 'Test',
          prenom: 'User',
          pseudo: 'testuser',
          roles: [{ role: { nom: 'user', description: 'Utilisateur standard' } }],
        },
      },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      // Attendre que useEffect soit exécuté
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.loading).toBe(false);
  });
}); 