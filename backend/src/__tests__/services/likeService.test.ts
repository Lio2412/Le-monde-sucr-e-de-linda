import prisma from '../../lib/prisma.js';
import { LikeService } from '../../services/likeService.js';
import { PrismaClient } from '@prisma/client';

describe('LikeService', () => {
  let testUser: any;
  let testRecipe: any;
  let testShare: any;

  beforeAll(async () => {
    // Créer les données de test
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User'
      }
    });

    testRecipe = await prisma.recipe.create({
      data: {
        title: 'Test Recipe',
        slug: 'test-recipe',
        description: 'Test description',
        preparationTime: 30,
        cookingTime: 45,
        difficulty: 'MEDIUM',
        servings: 4,
        category: 'DESSERT',
        authorId: testUser.id,
        tags: ['test']
      }
    });

    testShare = await prisma.recipeShare.create({
      data: {
        content: 'Test share',
        rating: 5,
        recipeId: testRecipe.id,
        userId: testUser.id
      }
    });
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await prisma.like.deleteMany();
    await prisma.recipeShare.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('toggleLike', () => {
    it('devrait créer un like', async () => {
      const result = await LikeService.toggleLike(testShare.id, testUser.id);
      expect(result.liked).toBe(true);

      const like = await prisma.like.findFirst({
        where: {
          shareId: testShare.id,
          userId: testUser.id
        }
      });
      expect(like).toBeTruthy();
    });

    it('devrait supprimer un like existant', async () => {
      // D'abord créer un like
      await LikeService.toggleLike(testShare.id, testUser.id);
      
      // Ensuite le supprimer
      const result = await LikeService.toggleLike(testShare.id, testUser.id);
      expect(result.liked).toBe(false);

      const like = await prisma.like.findFirst({
        where: {
          shareId: testShare.id,
          userId: testUser.id
        }
      });
      expect(like).toBeNull();
    });
  });

  describe('getLikeCount', () => {
    it('devrait retourner le nombre correct de likes', async () => {
      // Créer quelques likes
      await LikeService.toggleLike(testShare.id, testUser.id);
      
      const count = await LikeService.getLikeCount(testShare.id);
      expect(count).toBe(1);
    });
  });

  describe('hasUserLiked', () => {
    it('devrait retourner true si l\'utilisateur a liké', async () => {
      await LikeService.toggleLike(testShare.id, testUser.id);
      
      const hasLiked = await LikeService.hasUserLiked(testShare.id, testUser.id);
      expect(hasLiked).toBe(true);
    });

    it('devrait retourner false si l\'utilisateur n\'a pas liké', async () => {
      // S'assurer qu'il n'y a pas de like
      await prisma.like.deleteMany({
        where: {
          shareId: testShare.id,
          userId: testUser.id
        }
      });
      
      const hasLiked = await LikeService.hasUserLiked(testShare.id, testUser.id);
      expect(hasLiked).toBe(false);
    });
  });
}); 