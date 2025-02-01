import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('ProtectedRoute', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockAuthHook = {
    user: null,
    loading: false,
    isAuthenticated: false,
    hasRole: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuthHook);
  });

  it('devrait afficher le spinner de chargement pendant le chargement', () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthHook,
      loading: true,
    });

    render(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('devrait rediriger vers la page de connexion si non authentifié', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthHook,
      loading: false,
      isAuthenticated: false,
    });

    render(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/connexion');
    });
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('devrait afficher le contenu si authentifié sans rôles requis', () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthHook,
      loading: false,
      isAuthenticated: true,
    });

    render(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('devrait rediriger vers la page d\'accès refusé si les rôles requis ne sont pas satisfaits', async () => {
    const mockHasRole = jest.fn().mockReturnValue(false);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthHook,
      loading: false,
      isAuthenticated: true,
      hasRole: mockHasRole,
    });

    render(
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/acces-refuse');
    });
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('devrait afficher le contenu si les rôles requis sont satisfaits', () => {
    const mockHasRole = jest.fn().mockReturnValue(true);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthHook,
      loading: false,
      isAuthenticated: true,
      hasRole: mockHasRole,
    });

    render(
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(mockHasRole).toHaveBeenCalledWith('ADMIN');
  });

  it('devrait gérer plusieurs rôles requis', () => {
    const mockHasRole = jest.fn()
      .mockImplementation(role => role === 'EDITOR');
    
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthHook,
      loading: false,
      isAuthenticated: true,
      hasRole: mockHasRole,
    });

    render(
      <ProtectedRoute requiredRoles={['ADMIN', 'EDITOR']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(mockHasRole).toHaveBeenCalledWith('ADMIN');
    expect(mockHasRole).toHaveBeenCalledWith('EDITOR');
  });

  it('devrait réagir aux changements d\'état d\'authentification', async () => {
    const { rerender } = render(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    // Initialement non authentifié
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/connexion');
    });

    // Changement vers authentifié
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthHook,
      loading: false,
      isAuthenticated: true,
    });

    rerender(
      <ProtectedRoute>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  it('devrait gérer le cas où l\'utilisateur perd ses droits', async () => {
    const mockHasRole = jest.fn().mockReturnValue(true);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthHook,
      loading: false,
      isAuthenticated: true,
      hasRole: mockHasRole,
    });

    const { rerender } = render(
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();

    // L'utilisateur perd ses droits
    mockHasRole.mockReturnValue(false);
    rerender(
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <div>Contenu protégé</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/acces-refuse');
    });
  });
}); 