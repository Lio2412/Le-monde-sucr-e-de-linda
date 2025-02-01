import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

/**
 * Middleware d'authentification
 * Vérifie le token JWT dans les en-têtes et ajoute l'utilisateur à la requête
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Vérifier si le token est présent dans les headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];

    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.user = { userId: decoded.userId };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
  } catch (error) {
    console.error('Erreur dans le middleware d\'authentification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification'
    });
  }
};

/**
 * Middleware de vérification des rôles
 * Vérifie si l'utilisateur a les rôles requis
 */
export const hasRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié'
        });
      }

      const userRoles = user.roles.map((userRole: any) => userRole.role.nom);
      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      next();
    } catch (error) {
      console.error('Erreur dans le middleware de vérification des rôles:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des rôles'
      });
    }
  };
}; 