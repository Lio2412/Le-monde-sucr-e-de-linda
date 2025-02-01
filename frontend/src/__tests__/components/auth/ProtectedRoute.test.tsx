import { render, screen } from '@testing-library/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

// Mock du hook useAuth
jest.mock('@/hooks/useAuth');

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ProtectedRoute', () => {
  const mockUseAuth = useAuth as jest.Mock;
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockImplementation(() => ({
      user: null,
      loading: false,
      isAuthenticated: false,
      hasRole: jest.fn(),
    }));
  });

  it('devrait afficher le spinner pendant le chargement', () => {
    mockUseAuth.mockImplementation(() => ({
      loading: true,
      isAuthenticated: false,
      hasRole: jest.fn(),
    }));

    render(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('devrait rediriger vers la page de connexion si non authentifié', () => {
    mockUseAuth.mockImplementation(() => ({
      loading: false,
      isAuthenticated: false,
      hasRole: jest.fn(),
    }));

    render(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('devrait afficher le contenu si authentifié', () => {
    mockUseAuth.mockImplementation(() => ({
      loading: false,
      isAuthenticated: true,
      hasRole: jest.fn(),
    }));

    render(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('devrait rediriger vers la page d\'accès refusé si les rôles requis ne sont pas présents', () => {
    const mockHasRole = jest.fn().mockReturnValue(false);
    mockUseAuth.mockImplementation(() => ({
      loading: false,
      isAuthenticated: true,
      hasRole: mockHasRole,
    }));

    render(
      <ProtectedRoute requiredRoles={['admin']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
    expect(mockHasRole).toHaveBeenCalledWith('admin');
  });

  it('devrait afficher le contenu si les rôles requis sont présents', () => {
    const mockHasRole = jest.fn().mockReturnValue(true);
    mockUseAuth.mockImplementation(() => ({
      loading: false,
      isAuthenticated: true,
      hasRole: mockHasRole,
    }));

    render(
      <ProtectedRoute requiredRoles={['admin']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(mockHasRole).toHaveBeenCalledWith('admin');
  });
}); 