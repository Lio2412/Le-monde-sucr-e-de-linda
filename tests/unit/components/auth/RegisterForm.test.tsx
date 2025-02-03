import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { ChakraProvider, theme } from '@chakra-ui/react';

// Mock framer-motion to avoid context issues
vi.mock('framer-motion', () => ({
  motion: {
    div: vi.fn().mockImplementation(({ children, ...props }) => (
      <div {...props}>{children}</div>
    )),
  },
  AnimatePresence: vi.fn().mockImplementation(({ children }) => children),
}));

// Mock the next/router module
vi.mock('next/router', () => ({
  useRouter: vi.fn()
}));

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

describe('RegisterForm', () => {
  const mockRegister = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      register: mockRegister,
      user: null,
      error: null,
      loading: false
    });
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush
    });
  });

  const renderWithChakra = (component: React.ReactElement) => {
    return render(
      <ChakraProvider theme={theme}>
        {component}
      </ChakraProvider>
    );
  };

  it('devrait afficher le formulaire d\'inscription avec les champs requis', () => {
    renderWithChakra(<RegisterForm />);
    
    expect(screen.getByRole('textbox', { name: /nom/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
  });

  it('devrait afficher des erreurs pour les champs vides', async () => {
    renderWithChakra(<RegisterForm />);
    
    await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument();
      expect(screen.getByText("L'email est requis")).toBeInTheDocument();
      expect(screen.getByText('Le mot de passe est requis')).toBeInTheDocument();
      expect(screen.getByText('La confirmation du mot de passe est requise')).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur quand les mots de passe ne correspondent pas', async () => {
    renderWithChakra(<RegisterForm />);
    
    await userEvent.type(screen.getByRole('textbox', { name: /nom/i }), 'John Doe');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), 'differentpassword');
    
    await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur pour un format d\'email invalide', async () => {
    renderWithChakra(<RegisterForm />);
    
    await userEvent.type(screen.getByRole('textbox', { name: /nom/i }), 'John Doe');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'invalidemail');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), 'password123');
    
    await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(screen.getByText("Format d'email invalide")).toBeInTheDocument();
    });
  });

  it('devrait appeler la fonction register avec les données correctes', async () => {
    mockRegister.mockResolvedValueOnce({ success: true });
    
    renderWithChakra(<RegisterForm />);
    
    await userEvent.type(screen.getByRole('textbox', { name: /nom/i }), 'John Doe');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), 'password123');
    
    await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('devrait rediriger vers le tableau de bord après une inscription réussie', async () => {
    mockRegister.mockResolvedValueOnce({ success: true });
    
    renderWithChakra(<RegisterForm />);
    
    await userEvent.type(screen.getByRole('textbox', { name: /nom/i }), 'John Doe');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), 'password123');
    
    await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('devrait afficher un message d\'erreur en cas d\'échec de l\'inscription', async () => {
    const errorMessage = "Une erreur s'est produite lors de l'inscription";
    mockRegister.mockRejectedValueOnce(new Error(errorMessage));
    
    renderWithChakra(<RegisterForm />);
    
    await userEvent.type(screen.getByRole('textbox', { name: /nom/i }), 'John Doe');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), 'password123');
    
    await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });
});