import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  };
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
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
    mockLogin.mockResolvedValueOnce({
      success: true,
      redirectPath: '/dashboard',
    });

    render(<LoginPage />);

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const submitButton = screen.getByTestId('submit');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('devrait afficher une erreur en cas d\'échec de connexion', async () => {
    mockLogin.mockResolvedValueOnce({
      success: false,
      message: 'Email ou mot de passe incorrect',
    });

    render(<LoginPage />);

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const submitButton = screen.getByTestId('submit');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Email ou mot de passe incorrect'
      );
    });
  });

  it('devrait gérer les erreurs de réseau', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Erreur réseau'));

    render(<LoginPage />);

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const submitButton = screen.getByTestId('submit');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Erreur réseau');
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
    mockLogin.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

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