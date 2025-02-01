import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/connexion/page';
import AdminPage from '@/app/admin/page';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/providers/AuthProvider';
import { authService } from '@/services/authService';
import userEvent from '@testing-library/user-event';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/authService', () => ({
  authService: {
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
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

describe('Flux d\'authentification', () => {
  const mockRouter = {
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
      (authService.login as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-token',
        },
      });

      (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
        },
      });

      // Rendu de la page de connexion
      renderWithAuth(<LoginPage />);

      // Remplissage et soumission du formulaire
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByTestId('submit'));

      // Vérification de la redirection
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });

      // Test d'accès à une route protégée
      renderWithAuth(
        <ProtectedRoute>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
      });
    });

    it('devrait gérer les erreurs de connexion et bloquer l\'accès aux routes protégées', async () => {
      // Configuration du mock pour simuler une erreur
      (authService.login as jest.Mock).mockRejectedValueOnce(
        new Error('Email ou mot de passe incorrect')
      );

      // Rendu de la page de connexion
      renderWithAuth(<LoginPage />);

      // Tentative de connexion avec des identifiants invalides
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.click(screen.getByTestId('submit'));

      // Vérification de l'affichage du message d'erreur
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Email ou mot de passe incorrect'
        );
      });

      // Tentative d'accès à une route protégée
      renderWithAuth(
        <ProtectedRoute>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      );

      // Vérification de la redirection vers la page de connexion
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/connexion');
      });
    });

    it('devrait gérer correctement les rôles et les accès restreints', async () => {
      // Configuration des mocks pour un utilisateur avec des rôles spécifiques
      const adminUser = {
        ...mockUser,
        roles: [{ role: { nom: 'ADMIN', description: 'Administrateur' } }],
      };

      (authService.login as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: adminUser,
          token: 'mock-token',
        },
      });

      (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: adminUser,
        },
      });

      // Connexion en tant qu'admin
      renderWithAuth(<LoginPage />);
      
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'admin@test.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'adminpass' },
      });
      fireEvent.click(screen.getByTestId('submit'));

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });

      // Test d'accès à une route protégée nécessitant le rôle ADMIN
      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: adminUser,
        },
      });

      renderWithAuth(
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <div>Section Admin</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByText('Section Admin')).toBeInTheDocument();
      });

      // Simulation de la perte des droits admin
      (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser, // Utilisateur standard
        },
      });

      // Tentative d'accès à la section admin après la perte des droits
      renderWithAuth(
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <div>Section Admin</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/acces-refuse');
      });
    });

    it('devrait gérer la persistance de session et la récupération du profil', async () => {
      // Simulation d'un token existant
      localStorage.setItem('token', 'existing-token');

      // Configuration du mock pour la récupération du profil
      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
        },
      });

      // Tentative d'accès direct à une route protégée
      renderWithAuth(
        <ProtectedRoute>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      );

      // Vérification que le contenu est accessible sans nouvelle connexion
      await waitFor(() => {
        expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
      });

      // Vérification que getCurrentUser a été appelé
      await waitFor(() => {
        expect(authService.getCurrentUser).toHaveBeenCalled();
      });
    });

    it('devrait permettre l\'accès à la section admin pour les utilisateurs admin', async () => {
      // Mock du service d'authentification
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          user: mockUser
        }
      });

      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);

      // Rendu de la page admin
      render(
        <AuthProvider>
          <AdminPage />
        </AuthProvider>
      );

      // Vérification que le titre "Panel d'Administration" est présent
      await waitFor(() => {
        expect(screen.getByText('Panel d\'Administration')).toBeInTheDocument();
      });
    });
  });
}); 