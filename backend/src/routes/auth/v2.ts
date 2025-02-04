import { Router } from 'express';
import { register, login, getCurrentUser } from '../../controllers/authController';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

// Middleware de logging pour debug
router.use((req, res, next) => {
  console.log('Auth Route:', req.method, req.path);
  console.log('Request Body:', req.body);
  next();
});

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 * @body    {email, password, nom, prenom, pseudo}
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 * @body    {email, password}
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Récupération des informations de l'utilisateur connecté
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router;
