import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Route de test pour vérifier que l'API fonctionne
router.get('/test', (_req: Request, res: Response) => {
  res.json({ message: 'API is working' });
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = decodeURIComponent(req.params.slug)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9-]/g, '-') // Remplace les caractères spéciaux par des tirets
      .replace(/-+/g, '-') // Évite les tirets multiples
      .replace(/^-|-$/g, ''); // Supprime les tirets au début et à la fin

    console.log('Slug normalisé:', slug);
    
    const recipe = await prisma.recipe.findFirst({
      where: { 
        slug: {
          contains: slug.replace(/-/g, '') // Recherche plus souple
        }
      },
      include: {
        ingredients: true,
        steps: true,
        comments: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!recipe) {
      const allRecipes = await prisma.recipe.findMany();
      console.error('Slug non trouvé:', slug);
      return res.status(404).json({ 
        error: 'Recette non trouvée',
        searchedSlug: slug,
        availableSlugs: allRecipes.map(r => r.slug)
      });
    }

    console.log('Recette trouvée:', recipe.title);
    return res.json(recipe);
  } catch (error: any) {
    console.error('Erreur API:', error);
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

export default router; 