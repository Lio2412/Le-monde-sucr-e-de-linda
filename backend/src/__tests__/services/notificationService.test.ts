import prisma from '../../lib/prisma.js';
import { NotificationService, NotificationType } from '../../services/notificationService.js';
import { Notification } from '@prisma/client';

describe('NotificationService', () => {
  let testUser: any;
  let testRecipe: any;
  let testShare: any;
  let testNotification: any;

  beforeAll(async () => {
    // Créer les données de test
    testUser = await prisma.user.create({
      data: {
        email: 'test-notif@example.com',
        password: 'hashedPassword123',
        name: 'Test Notification User'
      }
    });

    testRecipe = await prisma.recipe.create({
      data: {
        title: 'Test Recipe Notifications',
        slug: 'test-recipe-notifications',
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
        comment: 'Test share for notifications',
        rating: 5,
        recipeId: testRecipe.id,
        userId: testUser.id
      }
    });
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await prisma.notification.deleteMany();
    await prisma.recipeShare.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('createNotification', () => {
    it('devrait créer une notification', async () => {
      const notification = await NotificationService.createNotification({
        type: NotificationType.LIKE,
        userId: testUser.id,
        message: 'Test notification',
        shareId: testShare.id
      });

      expect(notification).toBeTruthy();
      expect(notification.type).toBe(NotificationType.LIKE);
      expect(notification.message).toBe('Test notification');
      expect(notification.userId).toBe(testUser.id);
      expect(notification.shareId).toBe(testShare.id);
      expect(notification.read).toBe(false);
    });
  });

  describe('getUserNotifications', () => {
    beforeEach(async () => {
      // Créer plusieurs notifications
      await Promise.all([
        NotificationService.createNotification({
          type: NotificationType.LIKE,
          userId: testUser.id,
          message: 'Notification 1',
          shareId: testShare.id
        }),
        NotificationService.createNotification({
          type: NotificationType.COMMENT,
          userId: testUser.id,
          message: 'Notification 2',
          recipeId: testRecipe.id
        })
      ]);
    });

    it('devrait récupérer les notifications avec pagination', async () => {
      const result = await NotificationService.getUserNotifications(testUser.id, 1, 10);

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.hasMore).toBeDefined();
    });
  });

  describe('markAsRead', () => {
    it('devrait marquer une notification comme lue', async () => {
      const notification = await NotificationService.createNotification({
        type: NotificationType.LIKE,
        userId: testUser.id,
        message: 'Test mark as read',
        shareId: testShare.id
      });

      const updatedNotification = await NotificationService.markAsRead(notification.id);
      expect(updatedNotification.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('devrait marquer toutes les notifications comme lues', async () => {
      await NotificationService.markAllAsRead(testUser.id);

      const result = await NotificationService.getUserNotifications(testUser.id);
      expect(result.items.every((n: Notification) => n.read)).toBe(true);
    });
  });

  describe('getUnreadCount', () => {
    it('devrait retourner le nombre correct de notifications non lues', async () => {
      // Créer une notification non lue
      await NotificationService.createNotification({
        type: NotificationType.LIKE,
        userId: testUser.id,
        message: 'Test unread',
        shareId: testShare.id
      });

      const count = await NotificationService.getUnreadCount(testUser.id);
      expect(count).toBeGreaterThan(0);
    });
  });
}); 