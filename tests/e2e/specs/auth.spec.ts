import { test, expect } from '@playwright/test';

test.describe('Flux d\'authentification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('devrait permettre à un utilisateur de s\'inscrire et se connecter', async ({ page }) => {
    // Aller à la page d'inscription
    await page.click('text=S\'inscrire');
    await expect(page).toHaveURL('/inscription');

    // Remplir le formulaire d'inscription
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.click('button[type="submit"]');

    // Vérifier la redirection vers la page de connexion
    await expect(page).toHaveURL('/connexion');
    await expect(page.locator('.toast-success')).toBeVisible();

    // Se connecter avec les nouveaux identifiants
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Vérifier la redirection vers le tableau de bord
    await expect(page).toHaveURL('/tableau-de-bord');
    await expect(page.locator('text=Bienvenue')).toBeVisible();
  });

  test('devrait afficher une erreur pour des identifiants invalides', async ({ page }) => {
    // Aller à la page de connexion
    await page.click('text=Se connecter');
    await expect(page).toHaveURL('/connexion');

    // Essayer de se connecter avec des identifiants invalides
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Vérifier l'affichage du message d'erreur
    await expect(page.locator('.toast-error')).toBeVisible();
    await expect(page).toHaveURL('/connexion');
  });

  test('devrait permettre à un utilisateur de se déconnecter', async ({ page }) => {
    // Se connecter d'abord
    await page.click('text=Se connecter');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/tableau-de-bord');

    // Se déconnecter
    await page.click('text=Se déconnecter');

    // Vérifier la redirection vers la page d'accueil
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Se connecter')).toBeVisible();
  });

  test('devrait protéger les routes authentifiées', async ({ page }) => {
    // Essayer d'accéder à une route protégée sans être connecté
    await page.goto('http://localhost:3000/tableau-de-bord');

    // Vérifier la redirection vers la page de connexion
    await expect(page).toHaveURL('/connexion');
    await expect(page.locator('.toast-error')).toBeVisible();
  });

  test('devrait maintenir la session après actualisation', async ({ page }) => {
    // Se connecter
    await page.click('text=Se connecter');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/tableau-de-bord');

    // Actualiser la page
    await page.reload();

    // Vérifier que l'utilisateur est toujours connecté
    await expect(page).toHaveURL('/tableau-de-bord');
    await expect(page.locator('text=Bienvenue')).toBeVisible();
  });
}); 