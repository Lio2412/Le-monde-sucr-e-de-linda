import express from 'express';
import { authController } from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Récupération des informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', auth, authController.getCurrentUser);

export default router; 