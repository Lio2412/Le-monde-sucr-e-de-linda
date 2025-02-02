import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import RegisterPage from '@/app/inscription/page';
import { AuthProvider } from '@/providers/AuthProvider';
import { authService } from '@/services/authService';
import userEvent from '@testing-library/user-event';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/authService', () => ({
  authService: {
    register: jest.fn(),
    getCurrentUser: jest.fn(),
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

describe('Flux d\'inscription', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'nouveau@test.com',
    nom: 'Nouveau',
    prenom: 'Utilisateur',
    pseudo: 'nouveauuser',
    roles: [{ role: { nom: 'user', description: 'Utilisateur standard' } }],
  };

  const validRegistrationData = {
    email: 'nouveau@test.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    firstName: 'Nouveau',
    lastName: 'Utilisateur',
    newsletter: true,
    terms: true,
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

  describe('Processus d\'inscription', () => {
    it('devrait permettre une inscription réussie', async () => {
      // Mock du service d'authentification
      (authService.register as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          user: {
            id: 1,
            email: 'nouveau@test.com',
            prenom: 'Nouveau',
            nom: 'Utilisateur'
          }
        }
      });

      render(
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      );

      // Remplir le formulaire avec des données valides
      await userEvent.type(screen.getByTestId('firstName'), 'Nouveau');
      await userEvent.type(screen.getByTestId('lastName'), 'Utilisateur');
      await userEvent.type(screen.getByTestId('email'), 'nouveau@test.com');
      await userEvent.type(screen.getByTestId('password'), 'Password123!');
      await userEvent.type(screen.getByTestId('confirmPassword'), 'Password123!');

      // Soumettre le formulaire
      await userEvent.click(screen.getByTestId('submit'));

      // Vérifier que register a été appelé avec les bonnes données
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          prenom: 'Nouveau',
          nom: 'Utilisateur',
          email: 'nouveau@test.com',
          password: 'Password123!',
          pseudo: 'nouveauutilisateur'
        });
      });

      // Vérifier la redirection
      await waitFor(() => {
        expect(window.location.pathname).toBe('/connexion');
      });
    });

    it('devrait gérer les erreurs de validation du formulaire', async () => {
      render(
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      );

      // Soumettre le formulaire vide
      await userEvent.click(screen.getByTestId('submit'));

      // Vérification des messages d'erreur
      await waitFor(() => {
        const firstNameError = screen.getByTestId('firstName-error');
        const lastNameError = screen.getByTestId('lastName-error');
        const emailError = screen.getByTestId('email-error');
        const passwordError = screen.getByTestId('password-error');
        const confirmPasswordError = screen.getByTestId('confirmPassword-error');

        expect(firstNameError).toHaveTextContent('Le prénom est requis');
        expect(lastNameError).toHaveTextContent('Le nom est requis');
        expect(emailError).toHaveTextContent('L\'email est requis');
        expect(passwordError).toHaveTextContent('Le mot de passe est requis');
        expect(confirmPasswordError).toHaveTextContent('La confirmation du mot de passe est requise');
      });

      // Remplir le formulaire avec des données invalides
      await userEvent.type(screen.getByTestId('firstName'), 'A');
      await userEvent.type(screen.getByTestId('lastName'), 'B');
      await userEvent.type(screen.getByTestId('email'), 'invalidemail');
      await userEvent.type(screen.getByTestId('password'), 'simple');
      await userEvent.type(screen.getByTestId('confirmPassword'), 'different');

      // Soumettre le formulaire
      await userEvent.click(screen.getByTestId('submit'));

      // Vérification des nouveaux messages d'erreur
      await waitFor(() => {
        const firstNameError = screen.getByTestId('firstName-error');
        const lastNameError = screen.getByTestId('lastName-error');
        const emailError = screen.getByTestId('email-error');
        const passwordError = screen.getByTestId('password-error');
        const confirmPasswordError = screen.getByTestId('confirmPassword-error');

        expect(firstNameError).toHaveTextContent('Le prénom doit contenir au moins 2 caractères');
        expect(lastNameError).toHaveTextContent('Le nom doit contenir au moins 2 caractères');
        expect(emailError).toHaveTextContent('Format d\'email invalide');
        expect(passwordError).toHaveTextContent('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
        expect(confirmPasswordError).toHaveTextContent('Les mots de passe ne correspondent pas');
      });
    });

    it('devrait valider le format de l\'email', async () => {
      const { getByTestId } = renderWithAuth(<RegisterPage />);
      
      // Remplir l'email avec un format invalide
      const emailInput = getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
      
      const submitButton = getByTestId('submit');
      fireEvent.click(submitButton);

      // Vérification du message d'erreur
      await waitFor(() => {
        expect(getByTestId('email-error')).toHaveTextContent('Format d\'email invalide');
      }, { timeout: 3000 });
    });

    it('devrait valider la complexité du mot de passe', async () => {
      const { getByTestId } = renderWithAuth(<RegisterPage />);
      
      // Remplir le mot de passe avec une valeur simple
      const passwordInput = getByTestId('password');
      fireEvent.change(passwordInput, { target: { value: 'simple' } });
      
      const submitButton = getByTestId('submit');
      fireEvent.click(submitButton);

      // Vérification du message d'erreur
      await waitFor(() => {
        expect(getByTestId('password-error')).toHaveTextContent(
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'
        );
      }, { timeout: 3000 });
    });
  });
}); 