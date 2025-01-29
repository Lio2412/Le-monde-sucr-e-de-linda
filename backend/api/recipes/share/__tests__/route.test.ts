import { NextRequest } from 'next/server';
import { POST, GET, DELETE } from '../route';
import { prisma } from '../../../../lib/prisma';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getServerSession } from 'next-auth';

// Mock de next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => ({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com'
    }
  }))
}));

describe('API de partage de recettes', () => {
  const mockRecipe = {
    id: 'test-recipe-id',
    title: 'Test Recipe',
    slug: 'test-recipe'
  };

  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(async () => {
    // Créer les données de test
    await prisma.recipe.create({ data: mockRecipe });
    await prisma.user.create({ data: mockUser });
  });

  afterEach(async () => {
    // Nettoyer la base de données
    await prisma.recipeShare.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/recipes/share', () => {
    it('crée un nouveau partage avec image', async () => {
      const formData = new FormData();
      formData.append('recipeId', mockRecipe.id);
      formData.append('comment', 'Test comment');

      // Créer un faux fichier image
      const imageBlob = new Blob(['test-image'], { type: 'image/jpeg' });
      formData.append('image', imageBlob, 'test.jpg');

      const request = new NextRequest('http://localhost/api/recipes/share', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.recipeId).toBe(mockRecipe.id);
      expect(data.data.comment).toBe('Test comment');
      expect(data.data.imageUrl).toMatch(/^\/uploads\/shares\/.+\.jpg$/);
    });

    it('crée un partage sans image', async () => {
      const formData = new FormData();
      formData.append('recipeId', mockRecipe.id);
      formData.append('comment', 'Test comment');

      const request = new NextRequest('http://localhost/api/recipes/share', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.recipeId).toBe(mockRecipe.id);
      expect(data.data.comment).toBe('Test comment');
      expect(data.data.imageUrl).toBeNull();
    });
  });

  describe('GET /api/recipes/share', () => {
    it('récupère les partages d\'une recette', async () => {
      // Créer un partage de test
      await prisma.recipeShare.create({
        data: {
          recipeId: mockRecipe.id,
          userId: mockUser.id,
          comment: 'Test comment'
        }
      });

      const url = new URL('http://localhost/api/recipes/share');
      url.searchParams.set('recipeId', mockRecipe.id);

      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].recipeId).toBe(mockRecipe.id);
    });
  });

  describe('DELETE /api/recipes/share', () => {
    it('supprime un partage', async () => {
      // Créer un partage de test
      const share = await prisma.recipeShare.create({
        data: {
          recipeId: mockRecipe.id,
          userId: mockUser.id,
          comment: 'Test comment'
        }
      });

      const url = new URL('http://localhost/api/recipes/share');
      url.searchParams.set('id', share.id);

      const request = new NextRequest(url);
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Vérifier que le partage a été supprimé
      const deletedShare = await prisma.recipeShare.findUnique({
        where: { id: share.id }
      });
      expect(deletedShare).toBeNull();
    });
  });
}); 