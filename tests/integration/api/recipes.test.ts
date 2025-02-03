import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '@/pages/api/recipes';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

jest.mock('next-auth/jwt');
jest.mock('@/lib/prisma');

describe('Recipe API Endpoints', () => {
  const mockGetToken = getToken as jest.Mock;
  const mockPrisma = prisma as jest.MockedObject<typeof prisma>;

  beforeEach(() => {
    mockGetToken.mockClear();
    mockPrisma.recipe.create.mockClear();
    mockPrisma.recipe.findMany.mockClear();
    mockPrisma.recipe.update.mockClear();
    mockPrisma.recipe.delete.mockClear();
  });

  describe('GET /api/recipes', () => {
    it('returns list of recipes', async () => {
      const mockRecipes = [
        {
          id: '1',
          title: 'Gâteau au Chocolat',
          description: 'Délicieux gâteau',
          createdAt: new Date(),
          authorId: '1'
        }
      ];

      mockPrisma.recipe.findMany.mockResolvedValueOnce(mockRecipes);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET'
      });

      await getRecipes(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockRecipes);
    });

    it('handles query parameters correctly', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {
          category: 'Desserts',
          search: 'chocolat'
        }
      });

      await getRecipes(req, res);

      expect(mockPrisma.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { category: 'Desserts' },
              {
                OR: [
                  { title: { contains: 'chocolat', mode: 'insensitive' } },
                  { description: { contains: 'chocolat', mode: 'insensitive' } }
                ]
              }
            ]
          }
        })
      );
    });
  });

  describe('POST /api/recipes', () => {
    it('creates a new recipe when authenticated', async () => {
      mockGetToken.mockResolvedValueOnce({
        sub: '1',
        email: 'test@example.com'
      });

      const newRecipe = {
        title: 'Nouvelle Recette',
        description: 'Description',
        ingredients: [{ name: 'Sucre', quantity: '100', unit: 'g' }],
        steps: [{ description: 'Mélanger', order: 1 }]
      };

      mockPrisma.recipe.create.mockResolvedValueOnce({
        id: '1',
        ...newRecipe,
        authorId: '1',
        createdAt: new Date()
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: newRecipe
      });

      await createRecipe(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toMatchObject({
        id: '1',
        ...newRecipe
      });
    });

    it('returns 401 when not authenticated', async () => {
      mockGetToken.mockResolvedValueOnce(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: { title: 'Test' }
      });

      await createRecipe(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it('validates required fields', async () => {
      mockGetToken.mockResolvedValueOnce({
        sub: '1',
        email: 'test@example.com'
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: { description: 'Missing title' }
      });

      await createRecipe(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toHaveProperty('error');
    });
  });

  describe('PUT /api/recipes/[id]', () => {
    it('updates recipe when user is author', async () => {
      mockGetToken.mockResolvedValueOnce({
        sub: '1',
        email: 'test@example.com'
      });

      mockPrisma.recipe.findUnique.mockResolvedValueOnce({
        id: '1',
        authorId: '1',
        title: 'Old Title'
      });

      const updates = { title: 'Updated Title' };

      mockPrisma.recipe.update.mockResolvedValueOnce({
        id: '1',
        ...updates,
        authorId: '1'
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '1' },
        body: updates
      });

      await updateRecipe(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject(updates);
    });

    it('returns 403 when user is not author', async () => {
      mockGetToken.mockResolvedValueOnce({
        sub: '2',
        email: 'other@example.com'
      });

      mockPrisma.recipe.findUnique.mockResolvedValueOnce({
        id: '1',
        authorId: '1',
        title: 'Protected Recipe'
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '1' },
        body: { title: 'Attempt Update' }
      });

      await updateRecipe(req, res);

      expect(res._getStatusCode()).toBe(403);
    });
  });

  describe('DELETE /api/recipes/[id]', () => {
    it('deletes recipe when user is author', async () => {
      mockGetToken.mockResolvedValueOnce({
        sub: '1',
        email: 'test@example.com'
      });

      mockPrisma.recipe.findUnique.mockResolvedValueOnce({
        id: '1',
        authorId: '1',
        title: 'To Delete'
      });

      mockPrisma.recipe.delete.mockResolvedValueOnce({
        id: '1',
        authorId: '1',
        title: 'To Delete'
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: '1' }
      });

      await deleteRecipe(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it('returns 404 when recipe not found', async () => {
      mockGetToken.mockResolvedValueOnce({
        sub: '1',
        email: 'test@example.com'
      });

      mockPrisma.recipe.findUnique.mockResolvedValueOnce(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: 'nonexistent' }
      });

      await deleteRecipe(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });
});
