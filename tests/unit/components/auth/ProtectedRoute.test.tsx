import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { renderWithProviders } from '../../../setup/test-utils';
import { UserData, AuthContextType } from '@/types/auth';

// Mock du hook useAuth
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProtectedRoute', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUser: UserData = {
    id: '1',
    email: 'test@test.com',
    nom: 'Test',
    prenom: 'User',
    pseudo: 'testuser',
    roles: [{
      role: {
        nom: 'USER',
        description: 'Utilisateur standard'
      }
    }]
  };

  const mockAdminUser: UserData = {
    id: '1',
    email: 'test@test.com',
    nom: 'Admin',
    prenom: 'User',
    pseudo: 'adminuser',
    roles: [{
      role: {
        nom: 'ADMIN',
        description: 'Administrateur'
      }
    }]
  };

  const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
    user: null,
    setUser: jest.fn(),
    loading: false,
    error: null,
    isAuthenticated: () => false,
    hasRole: () => false,
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    register: jest.fn().mockResolvedValue(undefined),
    getCurrentUser: jest.fn().mockResolvedValue(undefined),
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(createMockAuthContext());
  });

  it('devrait afficher le spinner de chargement pendant le chargement', () => {
    mockUseAuth.mockReturnValue(createMockAuthContext({
      loading: true
    }));

    renderWithProviders(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('devrait rediriger vers la page de connexion si non authentifié', async () => {
    renderWithProviders(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/connexion');
    });
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('devrait afficher le contenu si authentifié sans rôles requis', () => {
    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: mockUser,
      isAuthenticated: () => true
    }));

    renderWithProviders(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('devrait rediriger vers la page d\'accès refusé si les rôles requis ne sont pas satisfaits', async () => {
    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: mockUser,
      isAuthenticated: () => true
    }));

    renderWithProviders(
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/acces-refuse');
    });
  });

  it('devrait afficher le contenu si les rôles requis sont satisfaits', () => {
    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: mockAdminUser,
      isAuthenticated: () => true,
      hasRole: () => true
    }));

    renderWithProviders(
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('devrait gérer plusieurs rôles requis', () => {
    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: mockAdminUser,
      isAuthenticated: () => true,
      hasRole: () => true
    }));

    renderWithProviders(
      <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('devrait réagir aux changements d\'état d\'authentification', async () => {
    const { rerender } = renderWithProviders(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(mockRouter.push).toHaveBeenCalledWith('/connexion');

    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: mockUser,
      isAuthenticated: () => true
    }));

    rerender(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('devrait gérer le cas où l\'utilisateur perd ses droits', async () => {
    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: mockAdminUser,
      isAuthenticated: () => true,
      hasRole: () => true
    }));

    const { rerender } = renderWithProviders(
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();

    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: mockUser,
      isAuthenticated: () => true,
      hasRole: () => false
    }));

    rerender(
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/acces-refuse');
    });
  });
}); 