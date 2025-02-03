import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from '@/components/NavBar';
import { useSession, signOut } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('NavBar Component', () => {
  const mockUseSession = useSession as jest.Mock;
  const mockSignOut = signOut as jest.Mock;

  beforeEach(() => {
    mockUseSession.mockClear();
    mockSignOut.mockClear();
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });
  });

  it('renders correctly when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    render(<NavBar />);
    expect(screen.getByText(/connexion/i)).toBeInTheDocument();
    expect(screen.queryByText(/déconnexion/i)).not.toBeInTheDocument();
  });

  it('renders correctly when user is authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' }
      },
      status: 'authenticated'
    });

    render(<NavBar />);
    expect(screen.getByText(/déconnexion/i)).toBeInTheDocument();
    expect(screen.queryByText(/connexion/i)).not.toBeInTheDocument();
  });

  it('handles navigation correctly', () => {
    render(<NavBar />);
    const homeLink = screen.getByText(/accueil/i);
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('displays user menu when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' }
      },
      status: 'authenticated'
    });

    render(<NavBar />);
    const userMenu = screen.getByRole('button', { name: /profil/i });
    fireEvent.click(userMenu);
    expect(screen.getByText(/mon profil/i)).toBeInTheDocument();
  });

  it('handles sign out correctly', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', email: 'test@example.com' }
      },
      status: 'authenticated'
    });

    render(<NavBar />);
    const signOutButton = screen.getByText(/déconnexion/i);
    fireEvent.click(signOutButton);
    expect(mockSignOut).toHaveBeenCalled();
  });
});
