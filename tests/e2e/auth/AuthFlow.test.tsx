import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/connexion/page';
import AdminPage from '@/app/admin/page';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/providers/AuthProvider';
import { authService } from '@/services/authService';
import userEvent from '@testing-library/user-event';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock('@/services/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => <div {...props} />,
    button: (props: any) => <button {...props} />,
  },
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    hasRole: (role: string) => role === 'admin',
    isAuthenticated: jest.fn(),
    register: jest.fn(),
  }),
}));

describe('Flux d\'authentification', () => {
  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'test@test.com',
    nom: 'Test',
    prenom: 'User',
    pseudo: 'testuser',
    roles: [{ role: { nom: 'USER', description: 'Utilisateur standard' } }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    localStorage.clear();
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(
      <AuthProvider>
        {ui}
      </AuthProvider>
    );
  };

  describe('Flux de connexion et accès aux routes protégées', () => {
    it('devrait permettre la connexion et l\'accès aux routes protégées', async () => {
      // Configuration des mocks
      const mockLogin = jest.fn().mockResolvedValueOnce({
        success: true,
        redirectPath: '/dashboard',
      });

      const mockUser = {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      };

      jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
        login: mockLogin,
        user: null,
        loading: false,
        error: null,
        isAuthenticated: () => false,
      }));

      // Rendu de la page de connexion
      renderWithAuth(<LoginPage />);

      // Remplissage et soumission du formulaire
      const emailInput = screen.getByTestId('email');
      const passwordInput = screen.getByTestId('password');
      const form = screen.getByRole('form');

      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      await act(async () => {
        fireEvent.submit(form);
      });

      // Vérification de la redirection
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@test.com',
          password: 'password123',
        });
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      }, { timeout: 2000 });

      // Test d'accès à une route protégée
      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getMe as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
        },
      });

      renderWithAuth(
        <ProtectedRoute>
          <div data-testid="protected-content">Contenu protégé</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('devrait gérer les erreurs de connexion et bloquer l\'accès aux routes protégées', async () => {
      // Configuration du mock pour simuler une erreur
      const mockLogin = jest.fn().mockRejectedValueOnce(new Error('incorrect'));

      jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
        login: mockLogin,
        user: null,
        loading: false,
        error: 'Email ou mot de passe incorrect',
      }));

      // Rendu de la page de connexion
      renderWithAuth(<LoginPage />);

      // Tentative de connexion avec des identifiants invalides
      await act(async () => {
        const emailInput = screen.getByTestId('email');
        const passwordInput = screen.getByTestId('password');
        const form = emailInput.closest('form');

        fireEvent.change(emailInput, {
          target: { name: 'email', value: 'test@test.com' },
        });
        fireEvent.change(passwordInput, {
          target: { name: 'password', value: 'wrongpassword' },
        });

        if (form) {
          fireEvent.submit(form);
        }
      });

      // Vérification de l'affichage du message d'erreur
      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toHaveTextContent('Email ou mot de passe incorrect');
      }, { timeout: 2000 });

      // Tentative d'accès à une route protégée
      jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
        login: mockLogin,
        user: null,
        loading: false,
        error: null,
        isAuthenticated: () => false,
      }));

      renderWithAuth(
        <ProtectedRoute>
          <div data-testid="protected-content">Contenu protégé</div>
        </ProtectedRoute>
      );

      // Vérification de la redirection vers la page de connexion
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/connexion');
      }, { timeout: 2000 });
    });

    it('devrait gérer correctement les rôles et les accès restreints', async () => {
      // Configuration des mocks pour un utilisateur avec des rôles spécifiques
      const adminUser = {
        ...mockUser,
        roles: [{ role: { nom: 'admin', description: 'Administrateur' } }],
      };

      const mockLogin = jest.fn().mockResolvedValueOnce({
        success: true,
        redirectPath: '/admin',
      });

      jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
        login: mockLogin,
        user: adminUser,
        loading: false,
        error: null,
        hasRole: (role: string) => role === 'admin',
        isAuthenticated: () => true,
      }));

      // Connexion en tant qu'admin
      renderWithAuth(<LoginPage />);
      
      await act(async () => {
        const emailInput = screen.getByTestId('email');
        const passwordInput = screen.getByTestId('password');
        const form = emailInput.closest('form');

        fireEvent.change(emailInput, {
          target: { name: 'email', value: 'admin@test.com' },
        });
        fireEvent.change(passwordInput, {
          target: { name: 'password', value: 'adminpass' },
        });

        if (form) {
          fireEvent.submit(form);
        }
      });

      // Vérification de la redirection vers la section admin
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/admin');
      }, { timeout: 2000 });

      // Test d'accès à une route protégée nécessitant le rôle ADMIN
      renderWithAuth(
        <ProtectedRoute requiredRoles={['admin']}>
          <div data-testid="admin-section">Section Admin</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('admin-section')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Simulation de la perte des droits admin
      jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
        login: mockLogin,
        user: mockUser,
        loading: false,
        error: null,
        hasRole: (role: string) => role !== 'admin',
        isAuthenticated: () => true,
      }));

      // Tentative d'accès à la section admin après la perte des droits
      renderWithAuth(
        <ProtectedRoute requiredRoles={['admin']}>
          <div data-testid="admin-section">Section Admin</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/acces-refuse');
      }, { timeout: 2000 });
    });

    it('devrait gérer la persistance de session et la récupération du profil', async () => {
      // Simulation d'un token existant
      localStorage.setItem('token', 'existing-token');

      // Configuration du mock pour la récupération du profil
      jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
        user: mockUser,
        loading: false,
        error: null,
        isAuthenticated: () => true,
        hasRole: (role: string) => role === 'user',
      }));

      // Tentative d'accès direct à une route protégée
      renderWithAuth(
        <ProtectedRoute>
          <div data-testid="protected-content">Contenu protégé</div>
        </ProtectedRoute>
      );

      // Vérification que le contenu est accessible sans nouvelle connexion
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Simulation de la perte de session
      localStorage.removeItem('token');
      jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: () => false,
        hasRole: () => false,
      }));

      // Tentative d'accès après la perte de session
      renderWithAuth(
        <ProtectedRoute>
          <div data-testid="protected-content">Contenu protégé</div>
        </ProtectedRoute>
      );

      // Vérification de la redirection vers la page de connexion
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/connexion');
      }, { timeout: 2000 });
    });

    it('devrait permettre l\'accès à la section admin pour les utilisateurs admin', async () => {
      // Mock du service d'authentification avec un utilisateur admin
      const adminUser = {
        ...mockUser,
        roles: [{ role: { nom: 'admin', description: 'Administrateur' } }],
      };

      (authService.getMe as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          user: adminUser
        }
      });

      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);

      // Rendu de la page admin
      renderWithAuth(
        <ProtectedRoute requiredRoles={['admin']}>
          <AdminPage />
        </ProtectedRoute>
      );

      // Vérification que le titre "Panel d'Administration" est présent
      await waitFor(() => {
        const adminTitle = screen.getByTestId('admin-title');
        expect(adminTitle).toBeInTheDocument();
        expect(adminTitle).toHaveTextContent('Panel d\'Administration');
      }, { timeout: 2000 });

      // Vérification des informations de l'utilisateur
      await waitFor(() => {
        expect(screen.getByText(adminUser.email)).toBeInTheDocument();
        expect(screen.getByText(new RegExp(adminUser.prenom))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(adminUser.nom))).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
}); 