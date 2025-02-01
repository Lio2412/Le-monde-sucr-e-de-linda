import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { vi } from 'vitest';

// Mock du hook useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

describe('RegisterForm', () => {
  const mockRegister = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null
    });
  });

  it('devrait afficher tous les champs requis', () => {
    render(<RegisterForm />);
    
    expect(screen.getByTestId('email')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByTestId('confirmPassword')).toBeInTheDocument();
    expect(screen.getByTestId('firstName')).toBeInTheDocument();
    expect(screen.getByTestId('lastName')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
  });

  it('devrait valider les champs obligatoires', async () => {
    render(<RegisterForm />);
    
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/la confirmation du mot de passe est requise/i)).toBeInTheDocument();
    });
  });

  it('devrait valider le format de l\'email', async () => {
    render(<RegisterForm />);
    
    const emailInput = screen.getByTestId('email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
    });
  });

  it('devrait valider la correspondance des mots de passe', async () => {
    render(<RegisterForm />);
    
    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirmPassword');
    
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });
    
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
  });

  it('devrait appeler la fonction register avec les données correctes', async () => {
    render(<RegisterForm />);
    
    const testData = {
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      firstName: 'John',
      lastName: 'Doe'
    };
    
    fireEvent.change(screen.getByTestId('email'), { target: { value: testData.email } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: testData.password } });
    fireEvent.change(screen.getByTestId('confirmPassword'), { target: { value: testData.confirmPassword } });
    fireEvent.change(screen.getByTestId('firstName'), { target: { value: testData.firstName } });
    fireEvent.change(screen.getByTestId('lastName'), { target: { value: testData.lastName } });
    
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: testData.email,
        password: testData.password,
        firstName: testData.firstName,
        lastName: testData.lastName
      });
    });
  });

  it('devrait afficher le loader pendant la soumission', () => {
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: true,
      error: null
    });

    render(<RegisterForm />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeDisabled();
  });

  it('devrait afficher les erreurs du serveur', () => {
    const errorMessage = 'Cet email est déjà utilisé';
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: errorMessage
    });

    render(<RegisterForm />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
}); 