import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import { prisma } from '../config/database';

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
        message: 'Accès non autorisé'
      });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];

    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Récupérer l'utilisateur
      const userRecord = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!userRecord) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Ajouter l'utilisateur à la requête
      req.user = {
        userId: decoded.userId
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
  } catch (error) {
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
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié'
        });
      }

      // Récupérer l'utilisateur avec ses rôles
      const userWithRoles = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!userWithRoles) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      const userRoles = userWithRoles.roles.map(userRole => userRole.role.nom);
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