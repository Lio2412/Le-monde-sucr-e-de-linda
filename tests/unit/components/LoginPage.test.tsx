import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/connexion/page';
import { useAuth } from '@/hooks/useAuth';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock de Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => <div {...props} />,
    button: (props: any) => <button {...props} />,
  },
}));

describe('LoginPage', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  const mockLoginFn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLoginFn,
      user: null,
      loading: false,
      error: null,
      isAuthenticated: () => false
    });
  });

  it('devrait afficher le formulaire de connexion avec tous les champs requis', () => {
    render(<LoginPage />);

    expect(screen.getByTestId('email')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByTestId('submit')).toBeInTheDocument();
    expect(screen.getByLabelText(/se souvenir de moi/i)).toBeInTheDocument();
    expect(screen.getByText(/mot de passe oublié/i)).toBeInTheDocument();
  });

  it('devrait permettre la saisie des champs du formulaire', () => {
    render(<LoginPage />);

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@test.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('devrait gérer la soumission réussie du formulaire', async () => {
    mockLoginFn.mockResolvedValueOnce({
      success: true,
      redirectPath: '/dashboard'
    });

    render(<LoginPage />);

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(mockLoginFn).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123'
      });
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('devrait afficher une erreur en cas d\'échec de connexion', async () => {
    const mockLogin = jest.fn().mockRejectedValueOnce(new Error('incorrect'));

    jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
      login: mockLogin,
      user: null,
      loading: false,
      error: 'Email ou mot de passe incorrect',
    }));

    render(<LoginPage />);

    await act(async () => {
      const emailInput = screen.getByTestId('email');
      const passwordInput = screen.getByTestId('password');
      const form = emailInput.closest('form');

      fireEvent.change(emailInput, {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(passwordInput, {
        target: { value: 'wrongpassword' },
      });

      if (form) {
        fireEvent.submit(form);
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Email ou mot de passe incorrect');
    });
  });

  it('devrait gérer les erreurs de réseau', async () => {
    const mockLogin = jest.fn().mockRejectedValueOnce(new Error('network'));

    jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockImplementation(() => ({
      login: mockLogin,
      user: null,
      loading: false,
      error: 'Problème de connexion',
    }));

    render(<LoginPage />);

    await act(async () => {
      const emailInput = screen.getByTestId('email');
      const passwordInput = screen.getByTestId('password');
      const form = emailInput.closest('form');

      fireEvent.change(emailInput, {
        target: { value: 'test@test.com' },
      });
      fireEvent.change(passwordInput, {
        target: { value: 'password123' },
      });

      if (form) {
        fireEvent.submit(form);
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Problème de connexion');
    });
  });

  it('devrait basculer la visibilité du mot de passe', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByTestId('password');
    const toggleButton = screen.getByRole('button', { name: '' }); // Bouton avec l'icône Eye/EyeOff

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('devrait désactiver le formulaire pendant la soumission', async () => {
    mockLoginFn.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<LoginPage />);

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const submitButton = screen.getByTestId('submit');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });
  });
}); 