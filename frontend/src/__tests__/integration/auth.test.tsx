import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import LoginPage from '@/app/connexion/page';
import type { TestUser } from '@/types/test';

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
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

describe('Flux d\'authentification', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUser: TestUser = {
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
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false);
  });

  it('devrait gérer le processus de connexion complet', async () => {
    // Mock de la réponse du service d'authentification
    (authService.login as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        user: mockUser,
        token: 'fake-token',
      },
    });

    render(<LoginPage />);

    // Simulation de la saisie utilisateur
    await act(async () => {
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password123' },
      });
    });

    // Simulation du clic sur le bouton de connexion
    await act(async () => {
      fireEvent.submit(screen.getByTestId('submit'));
    });

    // Vérifications
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('devrait afficher une erreur en cas d\'échec de connexion', async () => {
    // Mock d'une erreur d'authentification
    (authService.login as jest.Mock).mockRejectedValueOnce(
      new Error('Email ou mot de passe incorrect')
    );

    render(<LoginPage />);

    // Simulation de la saisie utilisateur
    await act(async () => {
      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'wrongpassword' },
      });
    });

    // Simulation du clic sur le bouton de connexion
    await act(async () => {
      fireEvent.submit(screen.getByTestId('submit'));
    });

    // Vérification de l'affichage du message d'erreur
    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  it('devrait maintenir la session utilisateur après actualisation', async () => {
    // Mock du localStorage
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem');
    mockGetItem.mockReturnValue('fake-token');

    // Mock de isAuthenticated et getCurrentUser
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        user: mockUser,
        token: 'fake-token',
      },
    });

    render(<LoginPage />);

    // Vérification que l'utilisateur est automatiquement connecté
    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });

    mockGetItem.mockRestore();
  });
}); 