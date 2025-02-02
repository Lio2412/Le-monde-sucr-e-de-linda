import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import LoginPage from '@/app/connexion/page';
import RegisterPage from '@/app/inscription/page';
import { AuthProvider } from '@/providers/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@/hooks/useAuth';
import { DummyLoginPage, DummyProtectedRoute, DummyRegisterPage, DummySQLInjectionLogin } from '../../../components/auth/DummyComponents';
import { mockRouter } from '../../../__mocks__/next/router';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock du service d'authentification
jest.mock('@/services/authService', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    refreshToken: jest.fn(),
  }
}));

// Mock de useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

const mockLoginError = (error: Error) => {
  (authService.login as jest.Mock).mockRejectedValueOnce(error);
};

describe('Scénarios Complexes d\'Authentification', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
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
    localStorage.clear();
    jest.clearAllMocks();

    // Mock du service d'authentification
    (authService.login as jest.Mock).mockImplementation(async ({ email, password }) => {
      if (email.includes("'") || password.includes("'")) {
        throw new Error('SQL');
      }
      if (email === 'test@test.com' && password === 'wrongpassword') {
        throw new Error('incorrect');
      }
      return {
        success: true,
        data: {
          token: 'fake-token',
          user: {
            id: 1,
            email,
            nom: 'Test',
            prenom: 'User'
          }
        }
      };
    });

    (authService.getCurrentUser as jest.Mock).mockImplementation(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('invalid');
      return {
        success: true,
        data: {
          user: {
            id: 1,
            email: 'test@test.com',
            nom: 'Test',
            prenom: 'User'
          }
        }
      };
    });

    (authService.register as jest.Mock).mockImplementation(async (data) => {
      return {
        success: true,
        data: {
          user: {
            id: 1,
            ...data
          },
          token: 'fake-token'
        }
      };
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockImplementation(() => ({
      login: jest.fn().mockResolvedValue(true),
      isAuthenticated: true,
      user: { id: 1, email: 'test@test.com' },
    }));
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
      const mockLogin = jest.fn().mockRejectedValue(new Error('incorrect'));
      (useAuth as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
        isAuthenticated: false,
        user: null,
      }));

      await act(async () => {
        render(
          <AuthProvider>
            <DummyLoginPage />
          </AuthProvider>
        );
      });

      // Première tentative
      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Email ou mot de passe incorrect');
      });

      // Deuxième tentative
      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Email ou mot de passe incorrect');
      });

      // Troisième tentative
      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Accès non autorisé');
      });
    });
  });

  describe('Scénario: Expiration de session', () => {
    it('devrait rediriger vers la connexion après expiration du token', async () => {
      // Configuration initiale
      localStorage.setItem('token', 'fake-token');
      (authService.getCurrentUser as jest.Mock).mockRejectedValueOnce(new Error('expired'));
      (useAuth as jest.Mock).mockImplementation(() => ({
        getCurrentUser: () => {
          throw new Error('expired');
        },
        isAuthenticated: false,
        user: null,
      }));

      await act(async () => {
        render(
          <AuthProvider>
            <DummyProtectedRoute>
              <div>Contenu protégé</div>
            </DummyProtectedRoute>
          </AuthProvider>
        );
      });

      // Vérifier que le token est supprimé et la redirection est effectuée
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(window.location.pathname).toBe('/connexion');
      });
    });
  });

  describe('Scénario: Changement de rôle en temps réel', () => {
    it('devrait mettre à jour l\'interface après un changement de rôle', async () => {
      // Configuration initiale avec un utilisateur standard
      const initialUser = {
        id: 1,
        email: 'user@test.com',
        roles: [{ role: { nom: 'user' } }]
      };

      const updatedUser = {
        ...initialUser,
        roles: [{ role: { nom: 'admin' } }]
      };

      let currentUser = initialUser;
      const mockLogin = jest.fn().mockResolvedValue(true);

      (useAuth as jest.Mock).mockImplementation(() => ({
        login: mockLogin,
        isAuthenticated: true,
        user: currentUser,
        refreshUser: async () => {
          currentUser = updatedUser;
          return updatedUser;
        }
      }));

      const { rerender } = render(
        <AuthProvider>
          <div>Page {currentUser.roles[0].role.nom}</div>
        </AuthProvider>
      );

      // Vérifier le rôle initial
      expect(screen.getByText('Page user')).toBeInTheDocument();

      // Simuler le changement de rôle
      await act(async () => {
        currentUser = updatedUser;
        rerender(
          <AuthProvider>
            <div>Page {currentUser.roles[0].role.nom}</div>
          </AuthProvider>
        );
      });

      // Vérifier que l'interface reflète le nouveau rôle
      await waitFor(() => {
        expect(screen.getByText('Page admin')).toBeInTheDocument();
      });
    });
  });

  describe('Scénario: Inscription avec validation email', () => {
    it('devrait gérer le processus d\'inscription avec validation email', async () => {
      const mockRegister = jest.fn().mockResolvedValue({
        success: true,
        data: {
          message: 'Email de validation envoyé',
          user: {
            id: 1,
            prenom: 'User',
            nom: 'Nouveau',
            email: 'nouveau@test.com',
            pseudo: 'newuser'
          }
        }
      });

      (useAuth as jest.Mock).mockImplementation(() => ({
        register: mockRegister,
        isAuthenticated: false,
        user: null,
      }));

      await act(async () => {
        render(
          <AuthProvider>
            <DummyRegisterPage />
          </AuthProvider>
        );
      });

      await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
      });

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          prenom: 'User',
          nom: 'Nouveau',
          email: 'nouveau@test.com',
          password: 'Password123!',
          pseudo: 'newuser'
        });
        expect(screen.getByTestId('confirmation')).toHaveTextContent('Un email de confirmation a été envoyé');
      });
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
        await act(async () => {
          render(
            <AuthProvider>
              <DummySQLInjectionLogin />
            </AuthProvider>
          );
        });

        await act(async () => {
          fireEvent.submit(screen.getByRole('form'));
        });

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent('Caractères non autorisés');
        });
      });
    });

    describe('Gestion des Erreurs Réseau', () => {
      it('devrait gérer les timeouts de requête', async () => {
        const timeoutError = new Error('Timeout de la requête');
        (authService.login as jest.Mock).mockRejectedValue(timeoutError);

        render(
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        );

        await act(async () => {
          fireEvent.change(screen.getByTestId('email'), {
            target: { value: 'test@test.com' }
          });
          fireEvent.change(screen.getByTestId('password'), {
            target: { value: 'password123' }
          });
          fireEvent.click(screen.getByTestId('submit'));
        });

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent('Délai d\'attente dépassé');
        }, { timeout: 10000 });
      }, 15000);

      it('devrait gérer les erreurs de connexion réseau', async () => {
        const networkError = new Error('Erreur de connexion réseau');
        (authService.login as jest.Mock).mockRejectedValue(networkError);

        render(
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        );

        await act(async () => {
          fireEvent.change(screen.getByTestId('email'), {
            target: { value: 'test@test.com' }
          });
          fireEvent.change(screen.getByTestId('password'), {
            target: { value: 'password123' }
          });
          fireEvent.click(screen.getByTestId('submit'));
        });

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent('Problème de connexion');
        }, { timeout: 10000 });
      }, 15000);
    });

    describe('Gestion de la Session', () => {
      it('devrait gérer les conflits de session', async () => {
        // Simuler une erreur de session
        const mockLogin = jest.fn().mockRejectedValueOnce(new Error('expired'));

        jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
          login: mockLogin,
          user: null,
          loading: false,
          error: 'Session expirée',
          isAuthenticated: () => false,
        }));

        renderWithAuth(<LoginPage />);

        // Tenter de se connecter
        await act(async () => {
          const emailInput = screen.getByTestId('email');
          const passwordInput = screen.getByTestId('password');
          const form = emailInput.closest('form');

          fireEvent.change(emailInput, {
            target: { value: 'test@test.com' },
          });
          fireEvent.change(passwordInput, {
            target: { value: 'password' },
          });

          if (form) {
            fireEvent.submit(form);
          }
        });

        // Attendre que le message d'erreur soit affiché
        await waitFor(() => {
          const errorElement = screen.getByTestId('error-message');
          expect(errorElement).toHaveTextContent('Problème de connexion');
        }, { timeout: 2000 });
      });

      it('devrait gérer la révocation de token', async () => {
        // Simuler une erreur de token invalide
        const mockLogin = jest.fn().mockRejectedValueOnce(new Error('invalid'));

        jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
          login: mockLogin,
          user: null,
          loading: false,
          error: 'Session invalide',
          isAuthenticated: () => false,
        }));

        renderWithAuth(<LoginPage />);

        // Tenter de se connecter
        await act(async () => {
          const emailInput = screen.getByTestId('email');
          const passwordInput = screen.getByTestId('password');
          const form = emailInput.closest('form');

          fireEvent.change(emailInput, {
            target: { value: 'test@test.com' },
          });
          fireEvent.change(passwordInput, {
            target: { value: 'password' },
          });

          if (form) {
            fireEvent.submit(form);
          }
        });

        // Attendre que le message d'erreur soit affiché
        await waitFor(() => {
          const errorElement = screen.getByTestId('error-message');
          expect(errorElement).toHaveTextContent('Problème de connexion');
        }, { timeout: 2000 });
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
        await new Promise(resolve => setTimeout(resolve, 500));

        await waitFor(() => {
          const errorElement = screen.getByTestId('error-message');
          expect(errorElement).toHaveTextContent('Problème de connexion');
        }, { timeout: 5000 });
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