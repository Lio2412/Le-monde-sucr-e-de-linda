import { Request, Response } from 'express';
import { authService } from '../services/authService.js';

class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, nom, prenom, pseudo } = req.body;

      // Validation des données
      if (!email || !password || !nom || !prenom || !pseudo) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont obligatoires'
        });
      }

      // Appel du service d'authentification
      const result = await authService.register({
        email,
        password,
        nom,
        prenom,
        pseudo
      });

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription'
      });
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validation des données
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe requis'
        });
      }

      // Appel du service d'authentification
      const result = await authService.login({
        email,
        password
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Email ou mot de passe incorrect'
      });
    }
  }

  /**
   * Récupération des informations de l'utilisateur connecté
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      // L'ID de l'utilisateur sera ajouté à la requête par le middleware d'authentification
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié'
        });
      }

      const user = await authService.getCurrentUser(userId);

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
    }
  }
}

export const authController = new AuthController(); 