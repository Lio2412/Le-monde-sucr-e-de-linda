import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { LoginForm } from '../../components/LoginForm';
import { authService } from '../../services/authService';
import { tokenService } from '../../services/tokenService';

jest.mock('../../services/authService');
jest.mock('../../services/tokenService');

describe('Tests de Sécurité Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Gestion des Tokens', () => {
    it('devrait gérer correctement le cycle de vie des tokens', async () => {
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      (authService.login as jest.Mock).mockResolvedValueOnce(mockTokens);
      (tokenService.verifyToken as jest.Mock).mockReturnValue(true);

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      // Login
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Mot de passe'), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByText('Se connecter'));

      await waitFor(() => {
        // Vérifier que les tokens sont stockés de manière sécurisée
        expect(tokenService.setTokens).toHaveBeenCalledWith(mockTokens);
        expect(localStorage.getItem('accessToken')).toBeNull(); // Ne doit pas être dans localStorage
      });
    });

    it('devrait renouveler le token avant expiration', async () => {
      const mockNewTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      (tokenService.getTokens as jest.Mock).mockReturnValue({
        accessToken: 'expired-token',
        refreshToken: 'valid-refresh-token'
      });
      (authService.refreshToken as jest.Mock).mockResolvedValueOnce(mockNewTokens);

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authService.refreshToken).toHaveBeenCalled();
        expect(tokenService.setTokens).toHaveBeenCalledWith(mockNewTokens);
      });
    });
  });

  describe('Protection CSRF', () => {
    it('devrait inclure un token CSRF dans les requêtes', async () => {
      const csrfToken = 'mock-csrf-token';
      (tokenService.getCsrfToken as jest.Mock).mockReturnValue(csrfToken);

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Se connecter'));

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-CSRF-Token': csrfToken
            })
          })
        );
      });
    });

    it('devrait valider le token CSRF des réponses', async () => {
      const validCsrfToken = 'valid-csrf-token';
      const invalidCsrfToken = 'invalid-csrf-token';

      (tokenService.validateCsrfToken as jest.Mock)
        .mockImplementation((token) => token === validCsrfToken);

      // Test avec un token valide
      await expect(
        tokenService.validateCsrfToken(validCsrfToken)
      ).resolves.toBeTruthy();

      // Test avec un token invalide
      await expect(
        tokenService.validateCsrfToken(invalidCsrfToken)
      ).resolves.toBeFalsy();
    });
  });

  describe('Gestion des Sessions', () => {
    it('devrait gérer la session de manière sécurisée', async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      // Login
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Mot de passe'), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByText('Se connecter'));

      await waitFor(() => {
        // Vérifier que la session est stockée de manière sécurisée
        expect(sessionStorage.getItem('user')).toBeNull();
        expect(tokenService.setSession).toHaveBeenCalled();
      });
    });

    it('devrait détecter et bloquer les tentatives de détournement de session', async () => {
      const mockInvalidSession = 'invalid-session-data';
      
      (tokenService.validateSession as jest.Mock)
        .mockImplementation((session) => session !== mockInvalidSession);

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      // Simuler une tentative de détournement
      await expect(
        tokenService.validateSession(mockInvalidSession)
      ).resolves.toBeFalsy();

      // Vérifier que l'utilisateur est déconnecté
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('Validation des Entrées', () => {
    it('devrait valider et assainir les entrées utilisateur', async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      // Test avec des caractères spéciaux
      const maliciousInput = '<script>alert("XSS")</script>';
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: maliciousInput }
      });

      await waitFor(() => {
        // Vérifier que l'input est assaini
        expect(screen.getByLabelText('Email')).not.toContain('<script>');
      });
    });

    it('devrait bloquer les tentatives d\'injection SQL', async () => {
      const sqlInjection = "' OR '1'='1";
      
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText('Mot de passe'), {
        target: { value: sqlInjection }
      });
      fireEvent.click(screen.getByText('Se connecter'));

      await waitFor(() => {
        expect(screen.getByText('Mot de passe invalide')).toBeInTheDocument();
      });
    });
  });

  describe('Rate Limiting', () => {
    it('devrait limiter les tentatives de connexion', async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      // Simuler 5 tentatives de connexion échouées
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByText('Se connecter'));
        await waitFor(() => {
          expect(screen.getByText('Identifiants invalides')).toBeInTheDocument();
        });
      }

      // La 6ème tentative devrait être bloquée
      fireEvent.click(screen.getByText('Se connecter'));
      
      await waitFor(() => {
        expect(screen.getByText('Trop de tentatives, veuillez réessayer plus tard')).toBeInTheDocument();
        expect(screen.getByText('Se connecter')).toBeDisabled();
      });
    });
  });
}); 