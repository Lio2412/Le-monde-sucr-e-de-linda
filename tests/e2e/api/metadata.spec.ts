import { test, expect } from '@playwright/test';

test.describe('API de métadonnées', () => {
  const baseUrl = 'http://localhost:3000/api';
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Obtenir le token d'authentification
    const response = await request.post(`${baseUrl}/auth/login`, {
      data: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    authToken = data.token;
  });

  test('devrait récupérer les métadonnées', async ({ request }) => {
    const response = await request.get(`${baseUrl}/metadata/test-page`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('description');
    expect(data).toHaveProperty('keywords');
    expect(data).toHaveProperty('ogImage');
  });

  test('devrait mettre à jour les métadonnées', async ({ request }) => {
    const metadata = {
      title: 'Nouveau Titre API Test',
      description: 'Nouvelle description pour le test API',
      keywords: 'api, test, integration',
      ogImage: '/images/test.jpg'
    };

    const response = await request.put(`${baseUrl}/metadata/test-page`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: metadata
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toEqual(expect.objectContaining(metadata));
  });

  test('devrait générer le sitemap', async ({ request }) => {
    const response = await request.post(`${baseUrl}/metadata/sitemap/generate`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.ok()).toBeTruthy();

    // Vérifier que le sitemap est accessible
    const sitemapResponse = await request.get('/sitemap.xml');
    expect(sitemapResponse.ok()).toBeTruthy();
    expect(sitemapResponse.headers()['content-type']).toContain('application/xml');
  });

  test('devrait générer des schémas Schema.org', async ({ request }) => {
    const recipeData = {
      title: 'Test Recipe API',
      description: 'Test Description',
      publishedAt: '2024-02-02',
      image: '/test-image.jpg',
      category: 'Desserts',
      prepTime: 'PT20M',
      cookTime: 'PT30M',
      totalTime: 'PT50M',
      servings: '8',
      ingredients: ['Test Ingredient'],
      instructions: ['Test Step']
    };

    const response = await request.post(`${baseUrl}/metadata/schema/Recipe`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: recipeData
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(typeof data).toBe('string');
    const schema = JSON.parse(data);
    expect(schema['@type']).toBe('Recipe');
  });

  test('devrait gérer les erreurs d\'authentification', async ({ request }) => {
    const response = await request.get(`${baseUrl}/metadata/test-page`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('devrait gérer les erreurs de validation', async ({ request }) => {
    const invalidMetadata = {
      // Données manquantes
    };

    const response = await request.put(`${baseUrl}/metadata/test-page`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: invalidMetadata
    });

    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error).toHaveProperty('message');
  });
}); 