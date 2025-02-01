import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Récupération des informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router; 