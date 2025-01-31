import request from 'supertest';
import { app } from '../../server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Routes des recettes - Tests d\'intégration', () => {
  let authToken: string;
  let testUser: any;
  let testRecipe: any;

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await prisma.recipe.deleteMany();
    await prisma.user.deleteMany();

    // Créer un utilisateur de test
    testUser = await prisma.user.create({
      data: {
        email: 'test-integration@test.com',
        password: 'hashedPassword123',
        name: 'Test User Integration'
      }
    });

    authToken = jwt.sign(
      { userId: testUser.id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Créer une recette de test
    testRecipe = await prisma.recipe.create({
      data: {
        title: 'Test Recipe',
        description: 'Test Description Long Enough',
        slug: 'test-recipe',
        preparationTime: 15,
        cookingTime: 30,
        difficulty: 'MEDIUM',
        servings: 4,
        category: 'DESSERT',
        tags: ['test'],
        authorId: testUser.id,
        ingredients: {
          create: [
            { name: 'Ingrédient test', quantity: 100, unit: 'g' }
          ]
        },
        steps: {
          create: [
            { description: 'Étape test', duration: 10, order: 1 }
          ]
        }
      },
      include: {
        author: true,
        ingredients: true,
        steps: true
      }
    });
  });

  afterAll(async () => {
    // Nettoyer la base de données et fermer la connexion
    await prisma.recipe.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/recipes', () => {
    it('devrait retourner la liste paginée des recettes', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.items)).toBeTruthy();
    });

    it('devrait supporter la pagination personnalisée', async () => {
      const response = await request(app)
        .get('/api/recipes?page=1&limit=5')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
      expect(response.body.totalPages).toBe(Math.ceil(response.body.total / 5));
    });

    it('devrait retourner une erreur pour une page invalide', async () => {
      const response = await request(app)
        .get('/api/recipes?page=0')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Paramètres de pagination invalides');
      expect(response.body).toHaveProperty('errors');
    });

    it('devrait retourner une erreur pour une limite invalide', async () => {
      const response = await request(app)
        .get('/api/recipes?limit=0')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Paramètres de pagination invalides');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/recipes/:slug', () => {
    it('devrait retourner une recette par son slug', async () => {
      const response = await request(app)
        .get(`/api/recipes/${testRecipe.slug}`)
        .expect(200);

      expect(response.body.id).toBe(testRecipe.id);
      expect(response.body.title).toBe(testRecipe.title);
    });

    it('devrait retourner 404 pour une recette inexistante', async () => {
      await request(app)
        .get('/api/recipes/recette-inexistante')
        .expect(404);
    });
  });

  describe('POST /api/recipes', () => {
    it('devrait créer une nouvelle recette avec authentification', async () => {
      const newRecipe = {
        title: 'Test Recipe 2',
        description: 'Test Description Long Enough',
        slug: 'test-recipe-2',
        preparationTime: 15,
        cookingTime: 30,
        difficulty: 'MEDIUM',
        servings: 4,
        category: 'DESSERT',
        tags: ['test'],
        ingredients: [
          { name: 'Ingrédient test', quantity: 100, unit: 'g' }
        ],
        steps: [
          { description: 'Étape test', duration: 10, order: 1 }
        ]
      };

      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newRecipe)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newRecipe.title);
      expect(response.body.author.id).toBe(testUser.id);
    });

    it('devrait refuser la création sans authentification', async () => {
      const newRecipe = {
        title: 'Recette non autorisée',
        description: 'Test Description Long Enough',
        slug: 'test-recipe-3',
        preparationTime: 15,
        cookingTime: 30,
        difficulty: 'MEDIUM',
        servings: 4,
        category: 'DESSERT',
        tags: ['test']
      };

      await request(app)
        .post('/api/recipes')
        .send(newRecipe)
        .expect(401);
    });

    it('devrait retourner une erreur pour des données invalides', async () => {
      const invalidRecipe = {
        title: 'Te',
        description: 'Test',
        preparationTime: -1,
        cookingTime: 30,
        difficulty: 'INVALID',
        servings: 0,
        category: 'DESSERT',
        ingredients: [],
        steps: []
      };

      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRecipe)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Données de recette invalides');
      expect(response.body).toHaveProperty('errors');
    });

    it('devrait retourner une erreur pour un slug en double', async () => {
      const newRecipe = {
        title: 'Test Recipe Duplicate',
        description: 'Test Description Long Enough',
        slug: testRecipe.slug,
        preparationTime: 15,
        cookingTime: 30,
        difficulty: 'MEDIUM',
        servings: 4,
        category: 'DESSERT',
        tags: ['test'],
        ingredients: [
          { name: 'Ingrédient test', quantity: 100, unit: 'g' }
        ],
        steps: [
          { description: 'Étape test', duration: 10, order: 1 }
        ]
      };

      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newRecipe)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Une recette avec ce slug existe déjà');
    });
  });

  describe('PUT /api/recipes/:slug', () => {
    it('devrait mettre à jour une recette avec authentification', async () => {
      const updatedData = {
        title: 'Recette Mise à Jour',
        description: 'Nouvelle description mise à jour'
      };

      const response = await request(app)
        .put(`/api/recipes/${testRecipe.slug}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.description).toBe(updatedData.description);
    });

    it('devrait refuser la mise à jour sans authentification', async () => {
      await request(app)
        .put(`/api/recipes/${testRecipe.slug}`)
        .send({ title: 'Test' })
        .expect(401);
    });

    it('devrait refuser la mise à jour par un utilisateur non autorisé', async () => {
      const unauthorizedUser = await prisma.user.create({
        data: {
          email: 'unauthorized@test.com',
          password: 'hashedPassword123',
          name: 'Unauthorized User'
        }
      });

      const unauthorizedToken = jwt.sign(
        { userId: unauthorizedUser.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      await request(app)
        .put(`/api/recipes/${testRecipe.slug}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({ title: 'Test' })
        .expect(403);
    });
  });

  describe('DELETE /api/recipes/:slug', () => {
    it('devrait supprimer une recette avec authentification', async () => {
      await request(app)
        .delete(`/api/recipes/${testRecipe.slug}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const deletedRecipe = await prisma.recipe.findUnique({
        where: { slug: testRecipe.slug }
      });
      expect(deletedRecipe).toBeNull();
    });

    it('devrait refuser la suppression sans authentification', async () => {
      await request(app)
        .delete(`/api/recipes/${testRecipe.slug}`)
        .expect(401);
    });

    it('devrait refuser la suppression par un utilisateur non autorisé', async () => {
      const unauthorizedUser = await prisma.user.create({
        data: {
          email: 'unauthorized-delete@test.com',
          password: 'hashedPassword123',
          name: 'Unauthorized Delete User'
        }
      });

      const unauthorizedToken = jwt.sign(
        { userId: unauthorizedUser.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      await request(app)
        .delete(`/api/recipes/${testRecipe.slug}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .expect(403);
    });
  });

  describe('GET /api/recipes/search', () => {
    beforeEach(async () => {
      // Créer plusieurs recettes pour tester la recherche
      await Promise.all([
        prisma.recipe.create({
          data: {
            title: 'Gâteau au Chocolat',
            description: 'Un délicieux gâteau au chocolat',
            slug: 'gateau-chocolat',
            preparationTime: 30,
            cookingTime: 45,
            difficulty: 'EASY',
            servings: 8,
            category: 'DESSERT',
            tags: ['chocolat', 'gâteau'],
            authorId: testUser.id
          }
        }),
        prisma.recipe.create({
          data: {
            title: 'Tarte aux Pommes',
            description: 'Une tarte aux pommes traditionnelle',
            slug: 'tarte-pommes',
            preparationTime: 45,
            cookingTime: 60,
            difficulty: 'MEDIUM',
            servings: 6,
            category: 'DESSERT',
            tags: ['pomme', 'tarte'],
            authorId: testUser.id
          }
        })
      ]);
    });

    it('devrait rechercher des recettes par terme de recherche', async () => {
      const response = await request(app)
        .get('/api/recipes/search?q=chocolat')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toBe('Gâteau au Chocolat');
    });

    it('devrait filtrer les recettes par catégorie', async () => {
      const response = await request(app)
        .get('/api/recipes/search?category=DESSERT')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items.every((r: any) => r.category === 'DESSERT')).toBeTruthy();
    });

    it('devrait filtrer les recettes par difficulté', async () => {
      const response = await request(app)
        .get('/api/recipes/search?difficulty=EASY')
        .expect(200);

      expect(response.body.items.length).toBe(2);
      expect(response.body.items.every((r: any) => r.difficulty === 'EASY')).toBeTruthy();
    });

    it('devrait filtrer les recettes par temps de préparation maximum', async () => {
      const response = await request(app)
        .get('/api/recipes/search?maxPrepTime=20')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items.every((r: any) => r.preparationTime <= 20)).toBeTruthy();
    });

    it('devrait combiner plusieurs filtres', async () => {
      const response = await request(app)
        .get('/api/recipes/search?difficulty=EASY&maxPrepTime=20&category=DESSERT')
        .expect(200);

      expect(response.body.items.every((r: any) => 
        r.difficulty === 'EASY' && 
        r.preparationTime <= 20 && 
        r.category === 'DESSERT'
      )).toBeTruthy();
    });

    it('devrait retourner une liste vide pour une recherche sans résultats', async () => {
      const response = await request(app)
        .get('/api/recipes/search?q=introuvable')
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('devrait gérer les paramètres de recherche invalides', async () => {
      const response = await request(app)
        .get('/api/recipes/search?maxPrepTime=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Gestion des ingrédients et des étapes', () => {
    let recipeId: string;

    beforeEach(async () => {
      const recipe = await prisma.recipe.create({
        data: {
          title: 'Recette Test Ingrédients',
          description: 'Description test pour les ingrédients',
          slug: 'recette-test-ingredients',
          preparationTime: 20,
          cookingTime: 30,
          difficulty: 'MEDIUM',
          servings: 4,
          category: 'DESSERT',
          tags: ['test'],
          authorId: testUser.id
        }
      });
      recipeId = recipe.id;
    });

    describe('POST /api/recipes/:id/ingredients', () => {
      it('devrait ajouter des ingrédients à une recette', async () => {
        const ingredients = [
          { name: 'Farine', quantity: 250, unit: 'g' },
          { name: 'Sucre', quantity: 100, unit: 'g' },
          { name: 'Oeufs', quantity: 3, unit: 'unité' }
        ];

        const response = await request(app)
          .post(`/api/recipes/${recipeId}/ingredients`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ ingredients })
          .expect(201);

        expect(response.body).toHaveLength(3);
        expect(response.body[0]).toHaveProperty('name', 'Farine');
        expect(response.body[1]).toHaveProperty('quantity', 100);
        expect(response.body[2]).toHaveProperty('unit', 'unité');
      });

      it('devrait refuser l\'ajout d\'ingrédients sans authentification', async () => {
        await request(app)
          .post(`/api/recipes/${recipeId}/ingredients`)
          .send({ ingredients: [{ name: 'Test', quantity: 1, unit: 'g' }] })
          .expect(401);
      });

      it('devrait valider les données des ingrédients', async () => {
        const invalidIngredients = [
          { name: '', quantity: -1, unit: '' }
        ];

        const response = await request(app)
          .post(`/api/recipes/${recipeId}/ingredients`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ ingredients: invalidIngredients })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('errors');
      });
    });

    describe('POST /api/recipes/:id/steps', () => {
      it('devrait ajouter des étapes à une recette', async () => {
        const steps = [
          { description: 'Première étape', duration: 10, order: 1 },
          { description: 'Deuxième étape', duration: 15, order: 2 },
          { description: 'Troisième étape', duration: 20, order: 3 }
        ];

        const response = await request(app)
          .post(`/api/recipes/${recipeId}/steps`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ steps })
          .expect(201);

        expect(response.body).toHaveLength(3);
        expect(response.body[0]).toHaveProperty('order', 1);
        expect(response.body[1]).toHaveProperty('duration', 15);
        expect(response.body[2]).toHaveProperty('description', 'Troisième étape');
      });

      it('devrait refuser l\'ajout d\'étapes sans authentification', async () => {
        await request(app)
          .post(`/api/recipes/${recipeId}/steps`)
          .send({ steps: [{ description: 'Test', duration: 5, order: 1 }] })
          .expect(401);
      });

      it('devrait valider l\'ordre des étapes', async () => {
        const invalidSteps = [
          { description: 'Étape A', duration: 10, order: 2 },
          { description: 'Étape B', duration: 15, order: 2 }
        ];

        const response = await request(app)
          .post(`/api/recipes/${recipeId}/steps`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ steps: invalidSteps })
          .expect(400);

        expect(response.body).toHaveProperty('message', 'Ordre des étapes invalide');
      });

      it('devrait valider les données des étapes', async () => {
        const invalidSteps = [
          { description: '', duration: -1, order: 0 }
        ];

        const response = await request(app)
          .post(`/api/recipes/${recipeId}/steps`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ steps: invalidSteps })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('errors');
      });
    });

    describe('PUT /api/recipes/:id/ingredients/:ingredientId', () => {
      let ingredientId: string;

      beforeEach(async () => {
        const ingredient = await prisma.ingredient.create({
          data: {
            name: 'Ingrédient à modifier',
            quantity: 100,
            unit: 'g',
            recipe: {
              connect: {
                id: recipeId
              }
            }
          }
        });
        ingredientId = ingredient.id;
      });

      it('devrait modifier un ingrédient', async () => {
        const updateData = {
          name: 'Ingrédient modifié',
          quantity: 150,
          unit: 'ml'
        };

        const response = await request(app)
          .put(`/api/recipes/${recipeId}/ingredients/${ingredientId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toMatchObject(updateData);
      });
    });

    describe('PUT /api/recipes/:id/steps/:stepId', () => {
      let stepId: string;

      beforeEach(async () => {
        const step = await prisma.step.create({
          data: {
            description: 'Étape à modifier',
            duration: 10,
            order: 1,
            recipe: {
              connect: {
                id: recipeId
              }
            }
          }
        });
        stepId = step.id;
      });

      it('devrait modifier une étape', async () => {
        const updateData = {
          description: 'Étape modifiée',
          duration: 15,
          order: 2
        };

        const response = await request(app)
          .put(`/api/recipes/${recipeId}/steps/${stepId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toMatchObject(updateData);
      });
    });
  });

  describe('Gestion des commentaires et des notes', () => {
    let recipeId: string;
    let commentId: string;
    let ratingId: string;

    beforeEach(async () => {
      const recipe = await prisma.recipe.create({
        data: {
          title: 'Recette Test Commentaires',
          description: 'Description test pour les commentaires',
          slug: 'recette-test-commentaires',
          preparationTime: 20,
          cookingTime: 30,
          difficulty: 'MEDIUM',
          servings: 4,
          category: 'DESSERT',
          tags: ['test'],
          authorId: testUser.id
        }
      });
      recipeId = recipe.id;

      const comment = await prisma.comment.create({
        data: {
          content: 'Commentaire test',
          recipe: {
            connect: {
              id: recipeId
            }
          },
          user: {
            connect: {
              id: testUser.id
            }
          }
        }
      });
      commentId = comment.id;

      const rating = await prisma.rating.create({
        data: {
          value: 4,
          recipe: {
            connect: {
              id: recipeId
            }
          },
          user: {
            connect: {
              id: testUser.id
            }
          }
        }
      });
      ratingId = rating.id;
    });

    describe('POST /api/recipes/:id/comments', () => {
      it('devrait ajouter un commentaire', async () => {
        const commentData = {
          content: 'Excellente recette !'
        };

        const response = await request(app)
          .post(`/api/recipes/${recipeId}/comments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(commentData)
          .expect(201);

        expect(response.body).toHaveProperty('content', commentData.content);
        expect(response.body).toHaveProperty('userId', testUser.id);
      });

      it('devrait refuser un commentaire sans authentification', async () => {
        await request(app)
          .post(`/api/recipes/${recipeId}/comments`)
          .send({ content: 'Test' })
          .expect(401);
      });

      it('devrait valider le contenu du commentaire', async () => {
        const response = await request(app)
          .post(`/api/recipes/${recipeId}/comments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: '' })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.errors).toContain('Le contenu du commentaire est requis');
      });
    });

    describe('POST /api/recipes/:id/ratings', () => {
      it('devrait ajouter une note', async () => {
        const ratingData = {
          value: 5
        };

        const response = await request(app)
          .post(`/api/recipes/${recipeId}/ratings`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(ratingData)
          .expect(201);

        expect(response.body).toHaveProperty('value', ratingData.value);
        expect(response.body).toHaveProperty('userId', testUser.id);
      });

      it('devrait refuser une note sans authentification', async () => {
        await request(app)
          .post(`/api/recipes/${recipeId}/ratings`)
          .send({ value: 5 })
          .expect(401);
      });

      it('devrait valider la note (1-5)', async () => {
        const response = await request(app)
          .post(`/api/recipes/${recipeId}/ratings`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ value: 6 })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.errors).toContain('La note doit être comprise entre 1 et 5');
      });
    });

    describe('GET /api/recipes/:id/comments', () => {
      it('devrait récupérer les commentaires d\'une recette', async () => {
        const response = await request(app)
          .get(`/api/recipes/${recipeId}/comments`)
          .expect(200);

        expect(Array.isArray(response.body.items)).toBeTruthy();
        expect(response.body.items.length).toBeGreaterThan(0);
        expect(response.body.items[0]).toHaveProperty('content');
        expect(response.body.items[0]).toHaveProperty('user');
      });

      it('devrait supporter la pagination des commentaires', async () => {
        // Créer plusieurs commentaires supplémentaires
        await Promise.all([
          prisma.comment.createMany({
            data: Array.from({ length: 15 }, (_, i) => ({
              content: `Commentaire test ${i + 1}`,
              recipeId,
              userId: testUser.id
            }))
          })
        ]);

        const response = await request(app)
          .get(`/api/recipes/${recipeId}/comments?page=1&limit=10`)
          .expect(200);

        expect(response.body.items).toHaveLength(10);
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('totalPages');
        expect(response.body.page).toBe(1);
      });
    });

    describe('GET /api/recipes/:id/ratings', () => {
      it('devrait récupérer les statistiques des notes', async () => {
        // Ajouter plusieurs notes
        await Promise.all([
          prisma.rating.createMany({
            data: [
              { value: 5, recipeId, userId: testUser.id },
              { value: 4, recipeId, userId: testUser.id },
              { value: 4, recipeId, userId: testUser.id },
              { value: 3, recipeId, userId: testUser.id }
            ]
          })
        ]);

        const response = await request(app)
          .get(`/api/recipes/${recipeId}/ratings`)
          .expect(200);

        expect(response.body).toHaveProperty('averageRating');
        expect(response.body).toHaveProperty('totalRatings');
        expect(response.body).toHaveProperty('ratingDistribution');
        expect(response.body.ratingDistribution).toHaveProperty('5');
        expect(response.body.ratingDistribution).toHaveProperty('4');
        expect(response.body.ratingDistribution).toHaveProperty('3');
      });
    });

    describe('PUT /api/recipes/:id/comments/:commentId', () => {
      it('devrait modifier un commentaire', async () => {
        const updateData = {
          content: 'Commentaire modifié'
        };

        const response = await request(app)
          .put(`/api/recipes/${recipeId}/comments/${commentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toMatchObject(updateData);
      });

      it('devrait refuser la modification par un autre utilisateur', async () => {
        const otherUser = await prisma.user.create({
          data: {
            email: 'other@test.com',
            password: 'hashedPassword123',
            name: 'Other User'
          }
        });

        const otherToken = jwt.sign(
          { userId: otherUser.id },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        );

        await request(app)
          .put(`/api/recipes/${recipeId}/comments/${commentId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .send({ content: 'Tentative de modification' })
          .expect(403);
      });
    });

    describe('PUT /api/recipes/:id/ratings/:ratingId', () => {
      it('devrait modifier une note', async () => {
        const updateData = {
          value: 3
        };

        const response = await request(app)
          .put(`/api/recipes/${recipeId}/ratings/${ratingId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toMatchObject(updateData);
      });

      it('devrait refuser la modification par un autre utilisateur', async () => {
        const otherUser = await prisma.user.create({
          data: {
            email: 'other-rating@test.com',
            password: 'hashedPassword123',
            name: 'Other Rating User'
          }
        });

        const otherToken = jwt.sign(
          { userId: otherUser.id },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        );

        await request(app)
          .put(`/api/recipes/${recipeId}/ratings/${ratingId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .send({ value: 1 })
          .expect(403);
      });
    });

    describe('DELETE /api/recipes/:id/comments/:commentId', () => {
      it('devrait supprimer un commentaire', async () => {
        await request(app)
          .delete(`/api/recipes/${recipeId}/comments/${commentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);

        const deletedComment = await prisma.comment.findUnique({
          where: { id: commentId }
        });
        expect(deletedComment).toBeNull();
      });

      it('devrait refuser la suppression par un autre utilisateur', async () => {
        const otherUser = await prisma.user.create({
          data: {
            email: 'other-delete@test.com',
            password: 'hashedPassword123',
            name: 'Other Delete User'
          }
        });

        const otherToken = jwt.sign(
          { userId: otherUser.id },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        );

        await request(app)
          .delete(`/api/recipes/${recipeId}/comments/${commentId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(403);
      });
    });
  });

  describe('Gestion des partages de recettes', () => {
    let recipeId: string;
    let shareId: string;

    beforeEach(async () => {
      const recipe = await prisma.recipe.create({
        data: {
          title: 'Recette Test Partages',
          description: 'Description test pour les partages',
          slug: 'recette-test-partages',
          preparationTime: 20,
          cookingTime: 30,
          difficulty: 'MEDIUM',
          servings: 4,
          category: 'DESSERT',
          tags: ['test'],
          authorId: testUser.id
        }
      });
      recipeId = recipe.id;

      const share = await prisma.recipeShare.create({
        data: {
          image: 'test-image.jpg',
          note: 'Partage test',
          recipe: {
            connect: {
              id: recipeId
            }
          },
          user: {
            connect: {
              id: testUser.id
            }
          }
        }
      });
      shareId = share.id;
    });

    describe('POST /api/recipes/:id/shares', () => {
      it('devrait créer un partage de recette', async () => {
        const shareData = {
          image: 'nouvelle-image.jpg',
          note: 'Mon super gâteau !'
        };

        const response = await request(app)
          .post(`/api/recipes/${recipeId}/shares`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(shareData)
          .expect(201);

        expect(response.body).toHaveProperty('image', shareData.image);
        expect(response.body).toHaveProperty('note', shareData.note);
        expect(response.body).toHaveProperty('userId', testUser.id);
      });

      it('devrait refuser un partage sans authentification', async () => {
        await request(app)
          .post(`/api/recipes/${recipeId}/shares`)
          .send({ image: 'test.jpg', note: 'Test' })
          .expect(401);
      });

      it('devrait valider l\'image du partage', async () => {
        const response = await request(app)
          .post(`/api/recipes/${recipeId}/shares`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ note: 'Test sans image' })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.errors).toContain('L\'image est requise');
      });
    });

    describe('GET /api/recipes/:id/shares', () => {
      it('devrait récupérer les partages d\'une recette', async () => {
        const response = await request(app)
          .get(`/api/recipes/${recipeId}/shares`)
          .expect(200);

        expect(Array.isArray(response.body.items)).toBeTruthy();
        expect(response.body.items.length).toBeGreaterThan(0);
        expect(response.body.items[0]).toHaveProperty('image');
        expect(response.body.items[0]).toHaveProperty('note');
        expect(response.body.items[0]).toHaveProperty('user');
      });

      it('devrait supporter la pagination des partages', async () => {
        // Créer plusieurs partages supplémentaires
        await Promise.all([
          prisma.recipeShare.createMany({
            data: Array.from({ length: 15 }, (_, i) => ({
              image: `test-image-${i + 1}.jpg`,
              note: `Partage test ${i + 1}`,
              recipeId,
              userId: testUser.id
            }))
          })
        ]);

        const response = await request(app)
          .get(`/api/recipes/${recipeId}/shares?page=1&limit=10`)
          .expect(200);

        expect(response.body.items).toHaveLength(10);
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('totalPages');
        expect(response.body.page).toBe(1);
      });
    });

    describe('PUT /api/recipes/:id/shares/:shareId', () => {
      it('devrait modifier un partage', async () => {
        const updateData = {
          note: 'Note modifiée'
        };

        const response = await request(app)
          .put(`/api/recipes/${recipeId}/shares/${shareId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toMatchObject(updateData);
      });

      it('devrait refuser la modification par un autre utilisateur', async () => {
        const otherUser = await prisma.user.create({
          data: {
            email: 'other-share@test.com',
            password: 'hashedPassword123',
            name: 'Other Share User'
          }
        });

        const otherToken = jwt.sign(
          { userId: otherUser.id },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        );

        await request(app)
          .put(`/api/recipes/${recipeId}/shares/${shareId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .send({ note: 'Tentative de modification' })
          .expect(403);
      });
    });

    describe('DELETE /api/recipes/:id/shares/:shareId', () => {
      it('devrait supprimer un partage', async () => {
        await request(app)
          .delete(`/api/recipes/${recipeId}/shares/${shareId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);

        const deletedShare = await prisma.recipeShare.findUnique({
          where: { id: shareId }
        });
        expect(deletedShare).toBeNull();
      });

      it('devrait refuser la suppression par un autre utilisateur', async () => {
        const otherUser = await prisma.user.create({
          data: {
            email: 'other-share-delete@test.com',
            password: 'hashedPassword123',
            name: 'Other Share Delete User'
          }
        });

        const otherToken = jwt.sign(
          { userId: otherUser.id },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        );

        await request(app)
          .delete(`/api/recipes/${recipeId}/shares/${shareId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(403);
      });
    });
  });

  describe('Gestion des images des recettes', () => {
    let recipeId: string;

    beforeEach(async () => {
      const recipe = await prisma.recipe.create({
        data: {
          title: 'Recette Test Images',
          description: 'Description test pour les images',
          slug: 'recette-test-images',
          preparationTime: 20,
          cookingTime: 30,
          difficulty: 'MEDIUM',
          servings: 4,
          category: 'DESSERT',
          tags: ['test'],
          authorId: testUser.id
        }
      });
      recipeId = recipe.id;
    });

    describe('POST /api/recipes/:id/images/main', () => {
      it('devrait télécharger l\'image principale', async () => {
        const response = await request(app)
          .post(`/api/recipes/${recipeId}/images/main`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', Buffer.from('fake-image'), {
            filename: 'test-image.jpg',
            contentType: 'image/jpeg'
          })
          .expect(200);

        expect(response.body).toHaveProperty('mainImage');
        expect(response.body.mainImage).toMatch(/^\/uploads\/recipes\/.*\.jpg$/);
      });

      it('devrait refuser le téléchargement sans authentification', async () => {
        await request(app)
          .post(`/api/recipes/${recipeId}/images/main`)
          .attach('image', Buffer.from('fake-image'), {
            filename: 'test-image.jpg',
            contentType: 'image/jpeg'
          })
          .expect(401);
      });

      it('devrait valider le type de fichier', async () => {
        const response = await request(app)
          .post(`/api/recipes/${recipeId}/images/main`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', Buffer.from('fake-doc'), {
            filename: 'test.txt',
            contentType: 'text/plain'
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.errors).toContain('Format de fichier non supporté');
      });

      it('devrait valider la taille du fichier', async () => {
        const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
        const response = await request(app)
          .post(`/api/recipes/${recipeId}/images/main`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', largeBuffer, {
            filename: 'large-image.jpg',
            contentType: 'image/jpeg'
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.errors).toContain('Le fichier est trop volumineux');
      });
    });

    describe('POST /api/recipes/:id/images/steps/:stepId', () => {
      let stepId: string;

      beforeEach(async () => {
        const step = await prisma.step.create({
          data: {
            order: 1,
            description: 'Étape test',
            duration: 10,
            recipe: {
              connect: {
                id: recipeId
              }
            }
          }
        });
        stepId = step.id;
      });

      it('devrait télécharger l\'image d\'une étape', async () => {
        const response = await request(app)
          .post(`/api/recipes/${recipeId}/images/steps/${stepId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', Buffer.from('fake-step-image'), {
            filename: 'step-image.jpg',
            contentType: 'image/jpeg'
          })
          .expect(200);

        expect(response.body).toHaveProperty('image');
        expect(response.body.image).toMatch(/^\/uploads\/steps\/.*\.jpg$/);
      });

      it('devrait refuser le téléchargement pour une étape inexistante', async () => {
        await request(app)
          .post(`/api/recipes/${recipeId}/images/steps/invalid-step-id`)
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', Buffer.from('fake-step-image'), {
            filename: 'step-image.jpg',
            contentType: 'image/jpeg'
          })
          .expect(404);
      });
    });

    describe('DELETE /api/recipes/:id/images/main', () => {
      beforeEach(async () => {
        await prisma.recipe.update({
          where: { id: recipeId },
          data: {
            mainImage: '/uploads/recipes/test-image.jpg'
          }
        });
      });

      it('devrait supprimer l\'image principale', async () => {
        await request(app)
          .delete(`/api/recipes/${recipeId}/images/main`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);

        const updatedRecipe = await prisma.recipe.findUnique({
          where: { id: recipeId }
        });
        expect(updatedRecipe?.mainImage).toBeNull();
      });

      it('devrait refuser la suppression sans authentification', async () => {
        await request(app)
          .delete(`/api/recipes/${recipeId}/images/main`)
          .expect(401);
      });

      it('devrait refuser la suppression par un autre utilisateur', async () => {
        const otherUser = await prisma.user.create({
          data: {
            email: 'other-image@test.com',
            password: 'hashedPassword123',
            name: 'Other Image User'
          }
        });

        const otherToken = jwt.sign(
          { userId: otherUser.id },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        );

        await request(app)
          .delete(`/api/recipes/${recipeId}/images/main`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(403);
      });
    });

    describe('DELETE /api/recipes/:id/images/steps/:stepId', () => {
      let stepId: string;

      beforeEach(async () => {
        const step = await prisma.step.create({
          data: {
            order: 1,
            description: 'Étape test avec image',
            duration: 10,
            image: '/uploads/steps/test-step-image.jpg',
            recipe: {
              connect: {
                id: recipeId
              }
            }
          }
        });
        stepId = step.id;
      });

      it('devrait supprimer l\'image d\'une étape', async () => {
        await request(app)
          .delete(`/api/recipes/${recipeId}/images/steps/${stepId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);

        const updatedStep = await prisma.step.findUnique({
          where: { id: stepId }
        });
        expect(updatedStep?.image).toBeNull();
      });

      it('devrait refuser la suppression d\'une image d\'étape inexistante', async () => {
        await request(app)
          .delete(`/api/recipes/${recipeId}/images/steps/invalid-step-id`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('devrait refuser la suppression par un autre utilisateur', async () => {
        const otherUser = await prisma.user.create({
          data: {
            email: 'other-step-image@test.com',
            password: 'hashedPassword123',
            name: 'Other Step Image User'
          }
        });

        const otherToken = jwt.sign(
          { userId: otherUser.id },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        );

        await request(app)
          .delete(`/api/recipes/${recipeId}/images/steps/${stepId}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(403);
      });
    });
  });

  describe('POST /api/recipes/:id/images/steps/:stepId', () => {
    it('devrait gérer le téléchargement d\'une image d\'étape', async () => {
      const step = await prisma.step.findFirst({
        where: { recipeId: testRecipe.id }
      });

      if (!step) {
        throw new Error('Étape non trouvée');
      }

      await request(app)
        .post(`/api/recipes/${testRecipe.id}/images/steps/${step.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', Buffer.from('fake-image'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg'
        })
        .expect(200);
    });
  });
}); 