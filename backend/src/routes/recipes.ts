import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { RecipeService } from '../services/recipeService.js';
import { PrismaClient, Prisma } from '@prisma/client';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { ValidationError } from '../errors/ValidationError.js';
import { RecipeRequest, RecipeResponse, RecipeListResponse } from '../types/api.js';
import { NextFunction } from 'express';
import { CreateRecipeInput } from '../types/recipe.js';

const prisma = new PrismaClient();
const recipeService = new RecipeService(prisma);
const router = Router();

// Configuration de multer pour le stockage des images
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    const recipesDir = path.join(uploadDir, 'recipes');
    const stepsDir = path.join(uploadDir, 'steps');

    // Créer les répertoires s'ils n'existent pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    if (!fs.existsSync(recipesDir)) {
      fs.mkdirSync(recipesDir);
    }
    if (!fs.existsSync(stepsDir)) {
      fs.mkdirSync(stepsDir);
    }

    // Déterminer le répertoire de destination en fonction du type d'image
    const dest = _req.path.includes('/steps/') ? stepsDir : recipesDir;
    cb(null, dest);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté'));
    }
  }
});

// Schémas de validation
export const recipeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  slug: z.string().min(3).max(100),
  preparationTime: z.number().int().positive(),
  cookingTime: z.number().int().positive(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  servings: z.number().int().positive(),
  category: z.enum(['STARTER', 'MAIN', 'DESSERT', 'DRINK']),
  tags: z.array(z.string()),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1)
  })),
  steps: z.array(z.object({
    description: z.string().min(1),
    duration: z.number().int().positive(),
    order: z.number().int().positive()
  }))
});

const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1)
});

const stepSchema = z.object({
  description: z.string().min(1),
  duration: z.number().int().positive(),
  order: z.number().int().positive()
});

const paginationSchema = z.object({
  page: z.string().transform(Number).refine(n => n > 0, 'La page doit être supérieure à 0'),
  limit: z.string().transform(Number).refine(n => n > 0 && n <= 100, 'La limite doit être entre 1 et 100')
}).partial();

// Middleware pour vérifier si l'utilisateur est l'auteur de la recette
const isRecipeAuthor = async (req: RecipeRequest, res: Response, next: NextFunction) => {
  try {
    const recipe = await recipeService.getRecipeBySlug(req.params.slug || '');
    if (!recipe) {
      return res.status(404).json({
        status: 'error',
        message: 'Recette non trouvée'
      });
    }

    if (recipe.authorId !== req.user?.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'êtes pas autorisé à modifier cette recette'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Routes publiques
router.get('/', async (req: RecipeRequest, res: Response<RecipeListResponse>, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { search, category, difficulty } = req.query;

    let recipes;
    if (search) {
      recipes = await recipeService.searchRecipes(search, { page, limit });
    } else if (category || difficulty) {
      recipes = await recipeService.filterRecipes(
        {
          category: category as any,
          difficulty: difficulty as any
        },
        { page, limit }
      );
    } else {
      recipes = await recipeService.getAllRecipes({ page, limit });
    }

    res.json({
      status: 'success',
      data: {
        recipes: recipes.items,
        total: recipes.total,
        page: recipes.page,
        totalPages: recipes.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req: RecipeRequest, res: Response<RecipeResponse>, next: NextFunction) => {
  try {
    const recipe = await recipeService.getRecipeBySlug(req.params.slug || '');
    if (!recipe) {
      return res.status(404).json({
        status: 'error',
        message: 'Recette non trouvée'
      });
    }

    res.json({
      status: 'success',
      data: recipe
    });
  } catch (error) {
    next(error);
  }
});

// Routes protégées
router.use(authMiddleware);

router.post('/', async (req: RecipeRequest, res: Response<RecipeResponse>, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const recipeData = req.body as CreateRecipeInput;
    const slug = await recipeService.generateSlug(recipeData.title);
    const completeRecipeData = { ...recipeData, slug };

    recipeService.validateRecipe(completeRecipeData);
    const recipe = await recipeService.createRecipe(completeRecipeData, userId);

    res.status(201).json({
      status: 'success',
      data: recipe
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:slug', isRecipeAuthor, async (req: RecipeRequest, res: Response<RecipeResponse>, next: NextFunction) => {
  try {
    const recipe = await recipeService.updateRecipe(req.params.slug || '', req.body);
    res.json({
      status: 'success',
      data: recipe
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:slug', isRecipeAuthor, async (req: RecipeRequest, res: Response, next: NextFunction) => {
  try {
    await recipeService.deleteRecipe(req.params.slug || '');
    res.json({
      status: 'success',
      message: 'Recette supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// Routes pour les ingrédients
router.post('/:id/ingredients', authMiddleware, async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }

    if (recipe.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette recette' });
    }

    const validation = z.array(ingredientSchema).safeParse(req.body.ingredients);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Données d\'ingrédients invalides',
        errors: validation.error.errors.map(e => e.message)
      });
    }

    await recipeService.addIngredients(req.params.id, validation.data);
    const ingredients = await prisma.ingredient.findMany({
      where: { recipeId: req.params.id }
    });
    return res.status(201).json(ingredients);
  } catch (error) {
    console.error('Erreur lors de l\'ajout des ingrédients:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id/ingredients/:ingredientId', authMiddleware, async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }

    if (recipe.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette recette' });
    }

    const validation = ingredientSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Données d\'ingrédient invalides',
        errors: validation.error.errors.map(e => e.message)
      });
    }

    const updatedIngredient = await recipeService.updateIngredient(req.params.ingredientId, validation.data);
    return res.json(updatedIngredient);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ingrédient:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Routes pour les étapes
router.post('/:id/steps', authMiddleware, async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }

    if (recipe.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette recette' });
    }

    const validation = z.array(stepSchema).safeParse(req.body.steps);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Données d\'étapes invalides',
        errors: validation.error.errors.map(e => e.message)
      });
    }

    // Vérifier que les ordres sont uniques et consécutifs
    const orders = validation.data.map(step => step.order).sort((a, b) => a - b);
    const isValidOrder = orders.every((order, index) => order === index + 1);
    if (!isValidOrder) {
      return res.status(400).json({ message: 'Ordre des étapes invalide' });
    }

    await recipeService.addSteps(req.params.id, validation.data);
    const steps = await prisma.step.findMany({
      where: { recipeId: req.params.id },
      orderBy: { order: 'asc' }
    });
    return res.status(201).json(steps);
  } catch (error) {
    console.error('Erreur lors de l\'ajout des étapes:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id/steps/:stepId', authMiddleware, async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }

    if (recipe.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette recette' });
    }

    const validation = stepSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Données d\'étape invalides',
        errors: validation.error.errors.map(e => e.message)
      });
    }

    const updatedStep = await recipeService.updateStep(req.params.stepId, validation.data);
    return res.json(updatedStep);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étape:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Routes pour les images
router.post('/:id/images/main', authMiddleware, upload.single('image'), async (req: Request & { user?: { id: string }; file?: Express.Multer.File }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }

    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }

    if (recipe.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette recette' });
    }

    const imagePath = `/uploads/recipes/${req.file.filename}`;
    const updatedRecipe = await recipeService.updateRecipe(recipe.slug, { mainImage: imagePath });
    return res.json(updatedRecipe);
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image principale:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/:id/images/steps/:stepId', authMiddleware, upload.single('image'), async (req: Request & { user?: { id: string }; file?: Express.Multer.File }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }

    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }

    if (recipe.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette recette' });
    }

    const step = await prisma.step.findUnique({
      where: { id: req.params.stepId }
    });

    if (!step || step.recipeId !== req.params.id) {
      return res.status(404).json({ message: 'Étape non trouvée' });
    }

    const imagePath = `/uploads/steps/${req.file.filename}`;
    const updatedStep = await recipeService.updateStep(req.params.stepId, { image: imagePath });
    return res.json(updatedStep);
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image de l\'étape:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.delete('/:id/images/main', authMiddleware, async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }

    if (recipe.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette recette' });
    }

    if (recipe.mainImage) {
      const imagePath = path.join(__dirname, '../..', recipe.mainImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await recipeService.updateRecipe(recipe.slug, { mainImage: null });
    return res.sendStatus(204);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image principale:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.delete('/:id/images/steps/:stepId', authMiddleware, async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée' });
    }

    if (recipe.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette recette' });
    }

    const step = await prisma.step.findUnique({
      where: { id: req.params.stepId }
    });

    if (!step || step.recipeId !== req.params.id) {
      return res.status(404).json({ message: 'Étape non trouvée' });
    }

    if (step.image) {
      const imagePath = path.join(__dirname, '../..', step.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await recipeService.updateStep(req.params.stepId, { image: null });
    return res.sendStatus(204);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image de l\'étape:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router; 