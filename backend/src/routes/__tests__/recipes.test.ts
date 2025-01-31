import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { RecipeService } from '../../services/recipeService';
import recipeRoutes from '../recipes';

const prisma = new PrismaClient();

jest.mock('../../services/recipeService');

describe('Routes des recettes', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let mockRecipeService: jest.Mocked<RecipeService>;
  let testUser: { id: string; email: string; name: string };

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: 'hashedPassword123',
        name: 'Test User'
      }
    });
  });

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {},
      user: { id: testUser.id }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn()
    };
    nextFunction = jest.fn();

    mockRecipeService = {
      getAllRecipes: jest.fn(),
      getRecipeBySlug: jest.fn(),
      createRecipe: jest.fn(),
      updateRecipe: jest.fn(),
      deleteRecipe: jest.fn(),
      searchRecipes: jest.fn()
    } as unknown as jest.Mocked<RecipeService>;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/recipes', () => {
    it('devrait retourner une liste paginée de recettes', async () => {
      const mockRecipes = {
        items: [{
          id: '1',
          title: 'Recette Test',
          description: 'Description test',
          slug: 'recette-test',
          preparationTime: 30,
          cookingTime: 45,
          difficulty: 'MEDIUM' as const,
          servings: 4,
          category: 'DESSERT' as const,
          mainImage: null,
          tags: ['test'],
          authorId: testUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name
          },
          ingredients: [],
          steps: []
        }],
        total: 1,
        page: 1,
        totalPages: 1
      };

      mockRequest.query = { page: '1', limit: '10' };
      mockRecipeService.getAllRecipes.mockResolvedValue(mockRecipes);

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(mockRecipes);
    });

    it('devrait gérer les erreurs de pagination', async () => {
      mockRequest.query = { page: '0', limit: '100' };

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Paramètres de pagination invalides',
        errors: expect.any(Array)
      });
    });
  });

  describe('GET /api/recipes/:slug', () => {
    it('devrait retourner une recette par son slug', async () => {
      const mockRecipe = {
        id: '1',
        title: 'Recette Test',
        description: 'Description test',
        slug: 'recette-test',
        preparationTime: 30,
        cookingTime: 45,
        difficulty: 'MEDIUM' as const,
        servings: 4,
        category: 'DESSERT' as const,
        mainImage: null,
        tags: ['test'],
        authorId: testUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name
        },
        ingredients: [],
        steps: []
      };

      mockRequest.params = { slug: 'recette-test' };
      mockRecipeService.getRecipeBySlug.mockResolvedValue(mockRecipe);

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(mockRecipe);
    });

    it('devrait retourner 404 si la recette n\'existe pas', async () => {
      mockRequest.params = { slug: 'inexistant' };
      mockRecipeService.getRecipeBySlug.mockResolvedValue(null);

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Recette non trouvée'
      });
    });
  });

  describe('POST /api/recipes', () => {
    it('devrait créer une nouvelle recette', async () => {
      const newRecipe = {
        title: 'Nouvelle Recette',
        description: 'Description test',
        slug: 'nouvelle-recette',
        preparationTime: 30,
        cookingTime: 45,
        difficulty: 'MEDIUM' as const,
        servings: 4,
        category: 'DESSERT' as const,
        mainImage: null,
        tags: ['test'],
        ingredients: [
          { name: 'Ingrédient test', quantity: 100, unit: 'g' }
        ],
        steps: [
          { description: 'Étape test', duration: 10, order: 1 }
        ]
      };

      const createdRecipe = {
        ...newRecipe,
        id: '1',
        authorId: testUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name
        },
        ingredients: [{
          id: '1',
          name: 'Ingrédient test',
          quantity: 100,
          unit: 'g',
          recipeId: '1'
        }],
        steps: [{
          id: '1',
          description: 'Étape test',
          duration: 10,
          order: 1,
          image: null,
          recipeId: '1'
        }]
      };

      mockRequest.body = newRecipe;
      mockRecipeService.createRecipe.mockResolvedValue(createdRecipe);

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdRecipe);
    });
  });

  describe('PUT /api/recipes/:slug', () => {
    it('devrait mettre à jour une recette existante', async () => {
      const updateData = {
        title: 'Recette Modifiée',
        description: 'Description modifiée'
      };

      const existingRecipe = {
        id: '1',
        slug: 'recette-test',
        authorId: testUser.id,
        title: 'Recette Test',
        description: 'Description test',
        preparationTime: 30,
        cookingTime: 45,
        difficulty: 'MEDIUM' as const,
        servings: 4,
        category: 'DESSERT' as const,
        mainImage: null,
        tags: ['test'],
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name
        },
        ingredients: [],
        steps: []
      };

      const updatedRecipe = {
        ...existingRecipe,
        ...updateData
      };

      mockRequest.params = { slug: 'recette-test' };
      mockRequest.body = updateData;
      mockRecipeService.getRecipeBySlug.mockResolvedValue(existingRecipe);
      mockRecipeService.updateRecipe.mockResolvedValue(updatedRecipe);

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(updatedRecipe);
    });

    it('devrait retourner 404 si la recette à mettre à jour n\'existe pas', async () => {
      mockRequest.params = { slug: 'inexistant' };
      mockRequest.body = { title: 'Nouveau titre' };
      mockRecipeService.updateRecipe.mockRejectedValue(new Error('Recette non trouvée'));

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Recette non trouvée'
      });
    });
  });

  describe('DELETE /api/recipes/:slug', () => {
    it('devrait supprimer une recette existante', async () => {
      const deletedRecipe = {
        id: '1',
        slug: 'recette-test',
        authorId: testUser.id,
        title: 'Recette Test',
        description: 'Description test',
        preparationTime: 30,
        cookingTime: 45,
        difficulty: 'MEDIUM' as const,
        servings: 4,
        category: 'DESSERT' as const,
        mainImage: null,
        tags: ['test'],
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name
        },
        ingredients: [],
        steps: []
      };

      mockRequest.params = { slug: 'recette-test' };
      mockRecipeService.deleteRecipe.mockResolvedValue(deletedRecipe);

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(deletedRecipe);
    });

    it('devrait retourner 404 si la recette à supprimer n\'existe pas', async () => {
      mockRequest.params = { slug: 'inexistant' };
      mockRecipeService.deleteRecipe.mockRejectedValue(new Error('Recette non trouvée'));

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Recette non trouvée'
      });
    });
  });

  describe('GET /api/recipes/search', () => {
    it('devrait rechercher des recettes par mot-clé', async () => {
      const mockSearchResults = {
        items: [{
          id: '1',
          title: 'Gâteau au Chocolat',
          description: 'Un délicieux gâteau',
          slug: 'gateau-chocolat',
          preparationTime: 30,
          cookingTime: 45,
          difficulty: 'MEDIUM' as const,
          servings: 4,
          category: 'DESSERT' as const,
          mainImage: null,
          tags: ['chocolat', 'dessert'],
          authorId: testUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name
          },
          ingredients: [],
          steps: []
        }],
        total: 1,
        page: 1,
        totalPages: 1
      };

      mockRequest.query = { q: 'chocolat', page: '1', limit: '10' };
      mockRecipeService.searchRecipes.mockResolvedValue(mockSearchResults);

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(mockSearchResults);
    });

    it('devrait retourner une liste vide si aucune recette ne correspond', async () => {
      const emptyResults = {
        items: [],
        total: 0,
        page: 1,
        totalPages: 0
      };

      mockRequest.query = { q: 'introuvable', page: '1', limit: '10' };
      mockRecipeService.searchRecipes.mockResolvedValue(emptyResults);

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(emptyResults);
    });
  });

  describe('GET /api/recipes/filter', () => {
    it('devrait filtrer les recettes par catégorie', async () => {
      const mockFilterResults = {
        items: [{
          id: '1',
          title: 'Tarte aux Pommes',
          description: 'Une délicieuse tarte aux pommes',
          slug: 'tarte-aux-pommes',
          preparationTime: 30,
          cookingTime: 45,
          difficulty: 'MEDIUM' as const,
          servings: 8,
          category: 'DESSERT' as const,
          mainImage: null,
          tags: ['pomme', 'dessert'],
          authorId: testUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name
          },
          ingredients: [],
          steps: []
        }],
        total: 1,
        page: 1,
        totalPages: 1
      };

      mockRequest.query = { category: 'DESSERT', page: '1', limit: '10' };
      mockRecipeService.filterRecipes.mockResolvedValue(mockFilterResults);

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(mockFilterResults);
    });

    it('devrait filtrer les recettes par difficulté', async () => {
      const mockFilterResults = {
        items: [{
          id: '1',
          title: 'Recette Facile',
          description: 'Une recette très simple',
          slug: 'recette-facile',
          preparationTime: 15,
          cookingTime: 20,
          difficulty: 'EASY' as const,
          servings: 4,
          category: 'MAIN' as const,
          mainImage: null,
          tags: ['facile', 'rapide'],
          authorId: testUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name
          },
          ingredients: [],
          steps: []
        }],
        total: 1,
        page: 1,
        totalPages: 1
      };

      mockRequest.query = { difficulty: 'EASY', page: '1', limit: '10' };
      mockRecipeService.filterRecipes.mockResolvedValue(mockFilterResults);

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(mockFilterResults);
    });

    it('devrait gérer les filtres invalides', async () => {
      mockRequest.query = { category: 'INVALID' };

      await recipeRoutes(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Paramètres de filtrage invalides',
        errors: expect.any(Array)
      });
    });
  });
}); 