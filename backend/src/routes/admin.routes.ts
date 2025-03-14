import { Router, Request, Response, RequestHandler } from 'express';
import { prisma } from '../utils/prisma';
import { verifyToken, verifyPassword, generateToken } from '../utils/auth';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { validateSession } from '../middleware/auth';

// Créer un nouveau routeur Express
const router = Router();

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Type de fichier non supporté'));
      return;
    }
    cb(null, true);
  }
});

// Fonction de gestionnaire pour la validation de session admin
const validateSessionHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Aucun token fourni' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    
    if (!payload || !payload.userId) {
      res.status(401).json({ error: 'Token invalide' });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { 
        id: payload.userId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
    
    if (!user) {
      res.status(401).json({ error: 'Session invalide' });
      return;
    }
    
    res.json({
      valid: true,
      user,
      message: 'Session valide'
    });
  } catch (error) {
    console.error('Erreur lors de la validation de session:', error);
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

// Fonction de gestionnaire pour le tableau de bord administrateur
const getDashboardStats: RequestHandler = async (req: Request, res: Response) => {
  try {
    console.log('📊 API: Demande de statistiques du tableau de bord administrateur');
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Non autorisé', message: 'Token manquant' });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    
    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Non autorisé', message: 'Token invalide' });
    }
    
    // Vérifier que l'utilisateur est un admin
    const user = await prisma.user.findUnique({
      where: { 
        id: payload.userId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
    
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès interdit', message: 'Droits administrateur requis' });
    }
    
    // Statistiques utilisateurs
    const totalUsers = await prisma.user.count();
    
    // Statistiques recettes
    const totalRecipes = await prisma.recipe.count();
    
    // Pour les commentaires, nous n'avons pas de modèle de commentaires dans le schéma
    // On va donc mettre une valeur par défaut
    const totalComments = 0;
    
    // Récupération des recettes récentes
    const recentRecipes = await prisma.recipe.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Récupération des recettes (comme nous n'avons pas de champ "views", nous utilisons une autre métrique)
    const popularRecipes = await prisma.recipe.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc' // On utilise la date de création comme substitut
      },
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    });
    
    // Récupération des utilisateurs récents
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    // Récupération des utilisateurs actifs (comme nous n'avons pas lastLogin, on utilise updatedAt)
    const activeUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        updatedAt: 'desc' // On utilise la date de mise à jour comme substitut pour l'activité
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true
      }
    });
    
    // Comme nous n'avons pas de modèle de commentaires, on va retourner des tableaux vides
    const recentComments = [];
    const pendingComments = [];
    
    // Préparation des données du tableau de bord
    const dashboardData = {
      generalStats: {
        totalUsers,
        totalRecipes,
        totalComments
      },
      recipes: {
        recentRecipes,
        popularRecipes
      },
      users: {
        recentUsers,
        activeUsers
      },
      comments: {
        recentComments,
        pendingComments
      },
      lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ Statistiques du tableau de bord générées avec succès');
    res.json(dashboardData);
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      error: 'Erreur serveur', 
      message: error instanceof Error ? error.message : 'Erreur inconnue' 
    });
  }
};

// Fonction de gestionnaire pour la connexion admin
const loginAdmin: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('Tentative de connexion admin:', { email });
    
    // Vérifier que les identifiants sont fournis
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    // Rechercher l'utilisateur dans la base de données
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Si l'utilisateur n'existe pas ou n'est pas actif
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    // Générer un token JWT
    const token = generateToken(user);
    
    console.log('Connexion admin réussie pour:', email);
    
    // Retourner les données de l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword,
      message: 'Connexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la connexion admin:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

// Fonction de gestionnaire pour récupérer les recettes
const getRecipes: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 API: Récupération des recettes');
    
    // Vérification de l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Non autorisé', message: 'Token manquant' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    
    if (!payload || !payload.userId) {
      res.status(401).json({ error: 'Non autorisé', message: 'Token invalide' });
      return;
    }
    
    // Récupération des paramètres de pagination et de recherche
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchTerm = req.query.search as string || '';
    
    // Calcul de l'offset pour la pagination
    const skip = (page - 1) * pageSize;
    
    // Construction de la requête avec les filtres
    const whereClause: Prisma.RecipeWhereInput = searchTerm ? {
      OR: [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } }
      ]
    } : {};
    
    // Récupération des recettes avec pagination
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          categories: {
            include: {
              category: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          }
        }
      }),
      prisma.recipe.count({ where: whereClause })
    ]);
    
    // Calcul des informations de pagination
    const totalPages = Math.ceil(total / pageSize);
    
    console.log(`✅ ${recipes.length} recettes récupérées (page ${page}/${totalPages})`);
    res.json({
      recipes,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des recettes:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// Route pour l'upload d'images
router.post('/upload-image', validateSession, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
});

// Configuration des routes
router.post('/validate-session', validateSessionHandler);
router.get('/dashboard', getDashboardStats);
router.post('/login', loginAdmin);
router.get('/recipes', getRecipes);

export default router; 