import { Request, Response } from 'express';
import { authService } from '../services/authService';

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (req: Request, res: Response) => {
  try {
    console.log('=== Debug Register Controller ===');
    console.log('Request body:', req.body);

    const { email, password, nom, prenom, pseudo } = req.body;

    // Valider les données d'entrée
    if (!email || !password || !nom || !prenom || !pseudo) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    const result = await authService.register({ email, password, nom, prenom, pseudo });
    console.log('Service result:', result);

    const response = {
      success: true,
      data: result
    };
    console.log('Response to be sent:', response);

    return res.status(201).json(response);
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Valider les données d'entrée
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const result = await authService.login({ email, password });

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
};

/**
 * Récupérer les informations de l'utilisateur connecté
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const user = await authService.getCurrentUser(userId);

    return res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Utilisateur non trouvé'
    });
  }
};