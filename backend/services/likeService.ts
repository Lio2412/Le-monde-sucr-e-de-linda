import { prisma } from '../lib/prisma';

export class LikeService {
  static async toggleLike(shareId: string, userId: string): Promise<{ liked: boolean }> {
    const existingLike = await prisma.like.findUnique({
      where: {
        shareId_userId: {
          shareId,
          userId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      return { liked: false };
    }

    await prisma.like.create({
      data: {
        shareId,
        userId,
      },
    });
    return { liked: true };
  }

  static async getLikeCount(shareId: string): Promise<number> {
    return prisma.like.count({
      where: {
        shareId,
      },
    });
  }

  static async hasUserLiked(shareId: string, userId: string): Promise<boolean> {
    const like = await prisma.like.findUnique({
      where: {
        shareId_userId: {
          shareId,
          userId,
        },
      },
    });
    return !!like;
  }
} 