import { Router } from 'express';
import { prisma } from '../prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Get user profile
router.get('/profile', authMiddleware, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req: any, res) => {
  try {
    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    return res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router as userRoutes }; 