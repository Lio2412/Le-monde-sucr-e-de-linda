import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

// Mock des hooks
jest.mock('@/providers/AuthProvider');
jest.mock('next/navigation');

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    // Configuration des mocks
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher le formulaire de connexion', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('devrait afficher les erreurs de validation', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument();
    });
  });

  it('devrait soumettre le formulaire avec des données valides', async () => {
    const validData = {
      email: 'test@example.com',
      motDePasse: 'password123'
    };

    mockLogin.mockResolvedValueOnce({
      status: 200,
      data: {
        token: 'mock-token',
        user: {
          id: 1,
          email: validData.email,
          role: 'USER'
        }
      }
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: validData.email } });
    fireEvent.change(passwordInput, { target: { value: validData.motDePasse } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(validData);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('devrait rediriger vers le tableau de bord après une connexion réussie', async () => {
    const validData = {
      email: 'test@example.com',
      motDePasse: 'password123'
    };

    mockLogin.mockResolvedValueOnce({
      status: 200,
      data: {
        token: 'mock-token',
        user: {
          id: 1,
          email: validData.email,
          role: 'USER'
        }
      }
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: validData.email } });
    fireEvent.change(passwordInput, { target: { value: validData.motDePasse } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('devrait afficher une erreur en cas d\'échec de connexion', async () => {
    const invalidData = {
      email: 'test@example.com',
      motDePasse: 'wrongpassword'
    };

    mockLogin.mockRejectedValueOnce(new Error('Erreur de connexion'));

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: invalidData.email } });
    fireEvent.change(passwordInput, { target: { value: invalidData.motDePasse } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/une erreur est survenue lors de la connexion/i)).toBeInTheDocument();
    });
  });

  it('devrait désactiver le bouton de soumission pendant le chargement', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /connexion en cours/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('opacity-50');
    expect(submitButton).toHaveClass('cursor-not-allowed');
  });
}); 