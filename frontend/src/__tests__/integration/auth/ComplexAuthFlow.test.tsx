import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import LoginPage from '@/app/connexion/page';
import RegisterPage from '@/app/inscription/page';
import { AuthProvider } from '@/providers/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import userEvent from '@testing-library/user-event';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock du service d'authentification
jest.mock('@/services/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
    isAuthenticated: jest.fn(),
    register: jest.fn(),
  },
}));

const mockLoginError = (error: Error) => {
  (authService.login as jest.Mock).mockRejectedValueOnce(error);
};

describe('Scénarios Complexes d\'Authentification', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'test@test.com',
    nom: 'Test',
    prenom: 'User',
    pseudo: 'testuser',
    roles: [{ role: { nom: 'user', description: 'Utilisateur standard' } }],
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

  describe('Scénario: Tentatives de connexion multiples', () => {
    it('devrait bloquer après 3 tentatives échouées', async () => {
      (authService.login as jest.Mock)
        .mockRejectedValueOnce(new Error('Email ou mot de passe incorrect'))
        .mockRejectedValueOnce(new Error('Email ou mot de passe incorrect'))
        .mockRejectedValueOnce(new Error('Email ou mot de passe incorrect'));

      renderWithAuth(<LoginPage />);

      // Première tentative
      await act(async () => {
        fireEvent.change(screen.getByTestId('email'), {
          target: { value: 'test@test.com' },
        });
        fireEvent.change(screen.getByTestId('password'), {
          target: { value: 'wrong1' },
        });
        fireEvent.submit(screen.getByTestId('submit'));
      });

      // Deuxième tentative
      await act(async () => {
        fireEvent.change(screen.getByTestId('password'), {
          target: { value: 'wrong2' },
        });
        fireEvent.submit(screen.getByTestId('submit'));
      });

      // Troisième tentative
      await act(async () => {
        fireEvent.change(screen.getByTestId('password'), {
          target: { value: 'wrong3' },
        });
        fireEvent.submit(screen.getByTestId('submit'));
      });

      // Vérifier que le bouton est désactivé
      await waitFor(() => {
        expect(screen.getByTestId('submit')).toBeDisabled();
      });

      // Vérifier le message de blocage
      expect(screen.getByText(/trop de tentatives/i)).toBeInTheDocument();
    });
  });

  describe('Scénario: Expiration de session', () => {
    it('devrait rediriger vers la connexion après expiration du token', async () => {
      // Simuler une session valide
      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getMe as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { user: mockUser },
      });

      renderWithAuth(
        <ProtectedRoute>
          <div>Contenu protégé</div>
        </ProtectedRoute>
      );

      // Vérifier l'accès initial
      await waitFor(() => {
        expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
      });

      // Simuler l'expiration du token
      (authService.getMe as jest.Mock).mockRejectedValueOnce(
        new Error('Token expiré')
      );

      // Déclencher une vérification d'authentification
      await act(async () => {
        // Simuler un appel API qui échoue à cause du token expiré
        await authService.getMe('expired-token').catch(() => {});
      });

      // Vérifier la redirection
      expect(mockRouter.replace).toHaveBeenCalledWith('/connexion');
    });
  });

  describe('Scénario: Changement de rôle en temps réel', () => {
    it('devrait mettre à jour l\'interface après un changement de rôle', async () => {
      // Simuler une connexion initiale en tant qu'utilisateur standard
      (authService.login as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          token: 'initial-token',
        },
      });

      renderWithAuth(<LoginPage />);

      // Connexion initiale
      await act(async () => {
        fireEvent.change(screen.getByTestId('email'), {
          target: { value: 'test@test.com' },
        });
        fireEvent.change(screen.getByTestId('password'), {
          target: { value: 'password' },
        });
        fireEvent.submit(screen.getByTestId('submit'));
      });

      // Simuler une mise à jour du rôle (promotion admin)
      const updatedUser = {
        ...mockUser,
        roles: [{ role: { nom: 'admin', description: 'Administrateur' } }],
      };

      (authService.getMe as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { user: updatedUser },
      });

      // Déclencher une vérification d'authentification
      await act(async () => {
        await authService.getMe('token');
      });

      // Vérifier que l'interface reflète le nouveau rôle
      expect(mockRouter.replace).toHaveBeenCalledWith('/admin');
    });
  });

  describe('Scénario: Inscription avec validation email', () => {
    it('devrait gérer le processus d\'inscription avec validation email', async () => {
      const mockRegistrationResponse = {
        success: true,
        data: {
          message: 'Email de validation envoyé',
          user: {
            ...mockUser,
            emailVerified: false,
          },
        },
      };

      (authService.register as jest.Mock).mockResolvedValueOnce(mockRegistrationResponse);

      renderWithAuth(<RegisterPage />);

      // Remplir le formulaire d'inscription
      await act(async () => {
        fireEvent.change(screen.getByTestId('email'), {
          target: { value: 'nouveau@test.com' },
        });
        fireEvent.change(screen.getByTestId('password'), {
          target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByTestId('nom'), {
          target: { value: 'Nouveau' },
        });
        fireEvent.change(screen.getByTestId('prenom'), {
          target: { value: 'User' },
        });
        fireEvent.change(screen.getByTestId('pseudo'), {
          target: { value: 'newuser' },
        });
        fireEvent.submit(screen.getByTestId('submit'));
      });

      // Vérifier l'affichage du message de confirmation
      await waitFor(() => {
        expect(screen.getByText(/email de validation envoyé/i)).toBeInTheDocument();
      });

      // Simuler la validation de l'email
      const mockValidatedUser = {
        ...mockUser,
        emailVerified: true,
      };

      (authService.getMe as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { user: mockValidatedUser },
      });

      // Vérifier la redirection après validation
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Cas Limites et Erreurs Spécifiques', () => {
    describe('Validation des Entrées', () => {
      it('devrait gérer les caractères spéciaux dans les champs', async () => {
        renderWithAuth(<RegisterPage />);

        await act(async () => {
          fireEvent.change(screen.getByTestId('email'), {
            target: { value: 'test+special@test.com' },
          });
          fireEvent.change(screen.getByTestId('nom'), {
            target: { value: 'O\'Connor-Smith' },
          });
          fireEvent.change(screen.getByTestId('prenom'), {
            target: { value: 'Jean-François' },
          });
          fireEvent.change(screen.getByTestId('pseudo'), {
            target: { value: 'user_123-test' },
          });
          fireEvent.change(screen.getByTestId('password'), {
            target: { value: 'Password123!@#' },
          });
        });

        // Vérifier qu'il n'y a pas d'erreurs de validation
        expect(screen.queryByText(/caractères non autorisés/i)).not.toBeInTheDocument();
      });

      it('devrait rejeter les injections SQL basiques', async () => {
        renderWithAuth(<LoginPage />);

        await act(async () => {
          fireEvent.change(screen.getByTestId('email'), {
            target: { value: 'test@test.com\' OR \'1\'=\'1' },
          });
          fireEvent.change(screen.getByTestId('password'), {
            target: { value: 'password\' OR \'1\'=\'1' },
          });
          fireEvent.submit(screen.getByTestId('submit'));
        });

        await waitFor(() => {
          expect(screen.getByText(/caractères non autorisés/i)).toBeInTheDocument();
        });
      });
    });

    describe('Gestion des Erreurs Réseau', () => {
      it('devrait gérer les timeouts de requête', async () => {
        (authService.login as jest.Mock).mockImplementationOnce(() => 
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 5000);
          })
        );

        renderWithAuth(<LoginPage />);

        await act(async () => {
          fireEvent.change(screen.getByTestId('email'), {
            target: { value: 'test@test.com' },
          });
          fireEvent.change(screen.getByTestId('password'), {
            target: { value: 'password' },
          });
          fireEvent.submit(screen.getByTestId('submit'));
        });

        await waitFor(() => {
          expect(screen.getByText(/délai d'attente dépassé/i)).toBeInTheDocument();
        });
      });

      it('devrait gérer les erreurs de connexion réseau', async () => {
        (authService.login as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

        renderWithAuth(<LoginPage />);

        await act(async () => {
          fireEvent.change(screen.getByTestId('email'), {
            target: { value: 'test@test.com' },
          });
          fireEvent.change(screen.getByTestId('password'), {
            target: { value: 'password' },
          });
          fireEvent.submit(screen.getByTestId('submit'));
        });

        await waitFor(() => {
          expect(screen.getByText(/problème de connexion/i)).toBeInTheDocument();
        });
      });
    });

    describe('Gestion de la Session', () => {
      it('devrait gérer les conflits de session', async () => {
        // Simuler une erreur de session
        mockLoginError(new Error('expired'));

        renderWithAuth(<LoginPage />);

        // Tenter de se connecter
        await act(async () => {
          fireEvent.change(screen.getByTestId('email'), {
            target: { value: 'test@test.com' },
          });
          fireEvent.change(screen.getByTestId('password'), {
            target: { value: 'password' },
          });
          await fireEvent.submit(screen.getByTestId('submit'));
        });

        // Attendre que le message d'erreur soit affiché
        await new Promise(resolve => setTimeout(resolve, 100));

        await waitFor(() => {
          const errorElement = screen.getByTestId('error-message');
          expect(errorElement).toHaveTextContent('Session expirée');
          expect(mockRouter.replace).toHaveBeenCalledWith('/connexion');
        });
      });

      it('devrait gérer la révocation de token', async () => {
        // Simuler une erreur de token invalide
        mockLoginError(new Error('invalid'));

        renderWithAuth(<LoginPage />);

        // Tenter de se connecter
        await act(async () => {
          fireEvent.change(screen.getByTestId('email'), {
            target: { value: 'test@test.com' },
          });
          fireEvent.change(screen.getByTestId('password'), {
            target: { value: 'password' },
          });
          await fireEvent.submit(screen.getByTestId('submit'));
        });

        // Attendre que le message d'erreur soit affiché
        await new Promise(resolve => setTimeout(resolve, 100));

        await waitFor(() => {
          const errorElement = screen.getByTestId('error-message');
          expect(errorElement).toHaveTextContent('Session invalide');
          expect(mockRouter.replace).toHaveBeenCalledWith('/connexion');
        });
      });

      it('devrait gérer les erreurs de connexion génériques', async () => {
        // Simuler une erreur générique
        mockLoginError(new Error('Erreur inconnue'));

        renderWithAuth(<LoginPage />);

        // Tenter de se connecter
        await act(async () => {
          fireEvent.change(screen.getByTestId('email'), {
            target: { value: 'test@test.com' },
          });
          fireEvent.change(screen.getByTestId('password'), {
            target: { value: 'password' },
          });
          await fireEvent.submit(screen.getByTestId('submit'));
        });

        // Attendre que le message d'erreur soit affiché
        await new Promise(resolve => setTimeout(resolve, 100));

        await waitFor(() => {
          const errorElement = screen.getByTestId('error-message');
          expect(errorElement).toHaveTextContent('Problème de connexion');
        });
      });
    });

    describe('Validation des Données', () => {
      it('devrait valider le format de l\'email', async () => {
        renderWithAuth(<RegisterPage />);

        const emailsInvalides = [
          'test',
          'test@',
          '@test.com',
          'test@test',
          'test.com',
        ];

        for (const email of emailsInvalides) {
          await act(async () => {
            fireEvent.change(screen.getByTestId('email'), {
              target: { value: email },
            });
            fireEvent.blur(screen.getByTestId('email'));
          });

          await waitFor(() => {
            expect(screen.getByText(/email invalide/i)).toBeInTheDocument();
          });
        }
      });

      it('devrait valider la complexité du mot de passe', async () => {
        renderWithAuth(<RegisterPage />);

        const passwordsInvalides = [
          'court',           // Trop court
          'sansmajuscule1', // Pas de majuscule
          'SANSMINUS1',     // Pas de minuscule
          'SansNumero',     // Pas de chiffre
          'Sans Espace 1',  // Contient des espaces
        ];

        for (const password of passwordsInvalides) {
          await act(async () => {
            fireEvent.change(screen.getByTestId('password'), {
              target: { value: password },
            });
            fireEvent.blur(screen.getByTestId('password'));
          });

          await waitFor(() => {
            expect(
              screen.getByText(/mot de passe doit contenir/i)
            ).toBeInTheDocument();
          });
        }
      });
    });
  });
}); 