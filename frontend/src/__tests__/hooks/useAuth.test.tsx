import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock du service d'authentification
jest.mock('@/services/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait initialiser avec les valeurs par défaut', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('devrait gérer la connexion avec succès', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      nom: 'Test',
      prenom: 'User',
      pseudo: 'testuser',
      roles: [{ role: { nom: 'user', description: 'Utilisateur standard' } }],
    };

    (authService.login as jest.Mock).mockResolvedValue({
      data: { user: mockUser, token: 'fake-token' },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const loginResult = await result.current.login('test@test.com', 'password');
      expect(loginResult.success).toBe(true);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('devrait gérer l\'échec de connexion', async () => {
    (authService.login as jest.Mock).mockRejectedValue(new Error('Erreur de connexion'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const loginResult = await result.current.login('test@test.com', 'wrong-password');
      expect(loginResult.success).toBe(false);
      expect(loginResult.message).toBe('Erreur lors de la connexion');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('devrait gérer la déconnexion', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('devrait vérifier correctement les rôles', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      nom: 'Test',
      prenom: 'User',
      pseudo: 'testuser',
      roles: [
        { role: { nom: 'admin', description: 'Administrateur' } },
        { role: { nom: 'user', description: 'Utilisateur standard' } },
      ],
    };

    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useAuth());

    // Attendre que le hook charge les données utilisateur
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('user')).toBe(true);
    expect(result.current.hasRole('guest')).toBe(false);
  });
}); 