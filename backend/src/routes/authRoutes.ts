import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées
router.get('/me', authMiddleware, getCurrentUser);

export default router;
