import { test, expect } from '@playwright/test';

test.describe('Workflow de gestion des métadonnées', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter en tant qu'administrateur
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('devrait permettre de gérer les métadonnées d\'une page', async ({ page }) => {
    // Naviguer vers la page de gestion des métadonnées
    await page.goto('/admin/seo');
    await expect(page.locator('h1')).toContainText('Gestion des Métadonnées SEO');

    // Remplir le formulaire
    await page.fill('input[name="title"]', 'Nouveau Titre de Page');
    await page.fill('textarea[name="description"]', 'Nouvelle description de la page pour le SEO');
    await page.fill('input[name="keywords"]', 'mot-clé-1, mot-clé-2, mot-clé-3');
    await page.fill('input[name="ogImage"]', '/images/nouvelle-image.jpg');

    // Sauvegarder les modifications
    await page.click('button:text("Enregistrer les métadonnées")');

    // Vérifier la notification de succès
    await expect(page.locator('.toast')).toContainText('Métadonnées sauvegardées');

    // Vérifier l'aperçu
    await page.click('button:text("Aperçu")');
    await expect(page.locator('h3')).toContainText('Nouveau Titre de Page');
    await expect(page.locator('p')).toContainText('Nouvelle description');
  });

  test('devrait générer un sitemap', async ({ page }) => {
    await page.goto('/admin/seo/sitemap');
    await expect(page.locator('h1')).toContainText('Gestion du Sitemap');

    // Cliquer sur le bouton de génération
    await page.click('button:text("Générer le sitemap")');

    // Vérifier la notification de succès
    await expect(page.locator('.toast')).toContainText('Sitemap généré avec succès');

    // Vérifier que le sitemap est accessible
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('application/xml');
  });

  test('devrait générer des schémas Schema.org', async ({ page }) => {
    await page.goto('/admin/seo/schema');
    await expect(page.locator('h1')).toContainText('Gestion des Schémas Schema.org');

    // Générer un schéma de recette
    await page.click('button:text("Générer le schéma Recette")');
    await expect(page.locator('pre')).toContainText('"@type": "Recipe"');

    // Générer un schéma d'article
    await page.click('button:text("Articles de Blog")');
    await page.click('button:text("Générer le schéma Article")');
    await expect(page.locator('pre')).toContainText('"@type": "BlogPosting"');

    // Vérifier que le bouton de copie fonctionne
    await page.click('button:text("Copier")');
    await expect(page.locator('.toast')).toContainText('Copié');
  });

  test('devrait gérer les erreurs correctement', async ({ page }) => {
    await page.goto('/admin/seo');

    // Simuler une erreur de sauvegarde
    await page.route('**/api/metadata/**', route => route.fulfill({
      status: 500,
      body: 'Internal Server Error'
    }));

    await page.fill('input[name="title"]', 'Titre Test');
    await page.click('button:text("Enregistrer les métadonnées")');

    // Vérifier le message d'erreur
    await expect(page.locator('.toast')).toContainText('Erreur');
  });
}); 