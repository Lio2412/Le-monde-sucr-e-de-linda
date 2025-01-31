import { prisma } from '../lib/prisma';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  NEW_SHARE = 'NEW_SHARE',
}

interface CreateNotificationParams {
  type: NotificationType;
  userId: string;
  message: string;
  shareId?: string;
  recipeId?: string;
}

export class NotificationService {
  static async createNotification(params: CreateNotificationParams) {
    return prisma.notification.create({
      data: {
        type: params.type,
        message: params.message,
        userId: params.userId,
        shareId: params.shareId,
        recipeId: params.recipeId,
      },
    });
  }

  static async getUserNotifications(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        include: {
          share: {
            select: {
              id: true,
              comment: true,
              recipe: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
          recipe: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.notification.count({
        where: {
          userId,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: notifications,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  static async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  static async deleteNotification(notificationId: string) {
    return prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });
  }
} 