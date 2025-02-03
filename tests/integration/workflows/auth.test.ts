import { test, expect } from '@playwright/test';
import { adminAuth } from "../../frontend/src/services/auth";
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

test.describe('Flux d\'authentification', () => {
  test('devrait permettre à un utilisateur de s\'inscrire et être redirigé vers la page de connexion', async ({ page }) => {
    await page.goto('/inscription');
    
    // Remplir le formulaire d'inscription
    await page.fill('input[name="nom"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="motDePasse"]', 'Password123!');
    await page.fill('input[name="confirmationMotDePasse"]', 'Password123!');
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Vérifier la redirection vers la page de connexion
    await expect(page).toHaveURL('/connexion');
    
    // Vérifier le message de succès
    await expect(page.locator('.toast-success')).toContainText('Inscription réussie');
  });

  test('devrait permettre à un utilisateur de se connecter avec des identifiants valides', async ({ page }) => {
    await page.goto('/connexion');
    
    // Remplir le formulaire de connexion
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="motDePasse"]', 'Password123!');
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Vérifier la redirection vers le tableau de bord
    await expect(page).toHaveURL('/tableau-de-bord');
    
    // Vérifier le message de bienvenue
    await expect(page.locator('h1')).toContainText('Bienvenue');
  });

  test('devrait afficher une erreur pour des identifiants invalides', async ({ page }) => {
    await page.goto('/connexion');
    
    // Remplir le formulaire avec des identifiants invalides
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="motDePasse"]', 'WrongPassword123!');
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Vérifier que nous restons sur la page de connexion
    await expect(page).toHaveURL('/connexion');
    
    // Vérifier le message d'erreur
    await expect(page.locator('.toast-error')).toContainText('Identifiants invalides');
  });

  test('devrait permettre à un utilisateur de se déconnecter', async ({ page }) => {
    // Se connecter d'abord
    await page.goto('/connexion');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="motDePasse"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Cliquer sur le bouton de déconnexion
    await page.click('button[aria-label="Déconnexion"]');
    
    // Vérifier la redirection vers la page d'accueil
    await expect(page).toHaveURL('/');
    
    // Vérifier que le lien de connexion est visible
    await expect(page.locator('a[href="/connexion"]')).toBeVisible();
  });

  test('devrait protéger les routes authentifiées', async ({ page }) => {
    // Essayer d'accéder à une route protégée sans être connecté
    await page.goto('/tableau-de-bord');
    
    // Vérifier la redirection vers la page de connexion
    await expect(page).toHaveURL('/connexion');
  });

  test('devrait maintenir la session après un rafraîchissement de page', async ({ page }) => {
    // Se connecter
    await page.goto('/connexion');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="motDePasse"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Vérifier qu'on est sur le tableau de bord
    await expect(page).toHaveURL('/tableau-de-bord');
    
    // Rafraîchir la page
    await page.reload();
    
    // Vérifier qu'on est toujours sur le tableau de bord
    await expect(page).toHaveURL('/tableau-de-bord');
    await expect(page.locator('h1')).toContainText('Bienvenue');
  });
});

describe('Tests d\'authentification administrateur', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'admin@test.com',
      password: 'password123'
    };

    it('devrait authentifier un administrateur avec des identifiants valides', async () => {
      const mockResponse = {
        status: 200,
        data: {
          token: 'mock-token',
          user: {
            id: 1,
            email: 'admin@test.com',
            role: 'ADMIN'
          },
          message: 'Connexion réussie'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const response = await adminAuth.login(mockCredentials);

      expect(response.status).toBe(200);
      expect(response.data.token).toBe('mock-token');
      expect(response.data.user).toEqual(mockResponse.data.user);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/login'),
        mockCredentials
      );
    });

    it('devrait rejeter des identifiants invalides', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Erreur de connexion'));

      await expect(adminAuth.login(mockCredentials))
        .rejects
        .toThrow('Identifiants invalides');
    });
  });

  describe('validateSession', () => {
    const mockToken = 'mock-token';

    it('devrait valider une session valide', async () => {
      const mockResponse = {
        data: {
          message: 'Session valide'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await adminAuth.validateSession(mockToken);

      expect(result.isValid).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/validate-session'),
        {},
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        })
      );
    });

    it('devrait invalider une session expirée', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Session expirée'));

      const result = await adminAuth.validateSession(mockToken);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Session invalide');
    });
  });

  describe('logout', () => {
    it('devrait se déconnecter avec succès', async () => {
      mockedAxios.post.mockResolvedValueOnce({});

      const result = await adminAuth.logout();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Déconnexion réussie');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/logout')
      );
    });

    it('devrait gérer les erreurs de déconnexion', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Erreur de déconnexion'));

      const result = await adminAuth.logout();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erreur lors de la déconnexion');
    });
  });
}); 