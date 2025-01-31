import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/test-db', async (req: Request, res: Response) => {
  try {
    const testRecipe = await prisma.recipe.findFirst();
    res.json({ dbConnected: !!testRecipe });
  } catch (error) {
    res.status(500).json({ error: 'DB connection failed' });
  }
});

export default router; 