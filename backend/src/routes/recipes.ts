import { Router, Response, NextFunction } from 'express';
import { RecipeRequest, RecipeResponse, RecipeListResponse } from '../types/api.js';

const router = Router();

// Mock data temporaire
const recipes = [
  {
    id: '1',
    title: 'Tarte au Citron Meringuée',
    description: 'Une délicieuse tarte au citron meringuée traditionnelle',
    slug: 'tarte-au-citron-meringuee',
    preparationTime: 45,
    cookingTime: 30,
    difficulty: 'MEDIUM',
    servings: 8,
    category: 'DESSERT',
    imageUrl: '/images/recipes/tarte-citron-meringuee.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    ingredients: [
      {
        id: '1',
        name: 'Citron',
        quantity: 4,
        unit: 'pièce',
        recipeId: '1'
      },
      {
        id: '2',
        name: 'Sucre',
        quantity: 200,
        unit: 'g',
        recipeId: '1'
      }
    ],
    steps: [
      {
        id: '1',
        description: 'Préparer la pâte sablée',
        duration: 15,
        order: 1,
        recipeId: '1'
      },
      {
        id: '2',
        description: 'Réaliser la crème au citron',
        duration: 20,
        order: 2,
        recipeId: '1'
      }
    ],
    tags: ['dessert', 'citron', 'meringue']
  }
];

// Routes
router.get('/', async (req: RecipeRequest, res: Response<RecipeListResponse>, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.json({
      status: 'success',
      data: {
        recipes,
        total: recipes.length,
        page,
        totalPages: Math.ceil(recipes.length / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req: RecipeRequest, res: Response<RecipeResponse>, next: NextFunction) => {
  try {
    console.log('Searching for recipe with slug:', req.params.slug);
    console.log('Available recipes:', recipes.map(r => r.slug));
    
    const recipe = recipes.find(r => {
      console.log('Comparing:', r.slug, 'with:', req.params.slug);
      return r.slug === req.params.slug;
    });

    if (!recipe) {
      console.log('Recipe not found for slug:', req.params.slug);
      return res.status(404).json({
        status: 'error',
        message: 'Recette non trouvée'
      });
    }

    console.log('Recipe found:', recipe.title);
    res.json({
      status: 'success',
      data: recipe
    });
  } catch (error) {
    next(error);
  }
});

export default router; 