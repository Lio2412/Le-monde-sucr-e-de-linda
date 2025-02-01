import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
}

/**
 * Middleware d'authentification
 * Vérifie le token JWT dans les en-têtes et ajoute l'utilisateur à la requête
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];

    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload;

      // Récupérer l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Ajouter l'utilisateur à la requête
      (req as any).user = user;
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