import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { prisma } from '../utils/prisma';
import { Role } from '../types/prisma';

/**
 * Middleware pour vérifier l'authentification
 * @param req - Requête entrante
 * @returns Réponse d'erreur ou undefined pour continuer
 */
export async function authMiddleware(req: NextRequest) {
  // Récupérer l'en-tête d'autorisation
  const authHeader = req.headers.get('authorization');
  
  // Extraire le token
  const token = extractTokenFromHeader(authHeader as string | undefined);
  if (!token) {
    return NextResponse.json(
      { error: 'Token d\'authentification manquant ou invalide' },
      { status: 401 }
    );
  }
  
  // Vérifier le token
  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    return NextResponse.json(
      { error: 'Token d\'authentification invalide' },
      { status: 401 }
    );
  }
  
  // Vérifier que l'utilisateur existe toujours en base de données
  const user = await prisma.user.findUnique({
    where: { id: decodedToken.userId },
    select: { id: true, isActive: true }
  });
  
  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur non trouvé' },
      { status: 404 }
    );
  }
  
  if (!user.isActive) {
    return NextResponse.json(
      { error: 'Ce compte a été désactivé' },
      { status: 403 }
    );
  }
  
  // Ajouter les informations utilisateur à la requête pour une utilisation ultérieure
  // Note: Next.js ne permet pas de modifier directement la requête, 
  // nous utiliserons donc le header pour passer ces informations
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', decodedToken.userId);
  requestHeaders.set('x-user-role', decodedToken.role);
  
  // Tout est OK, continuer avec les en-têtes mis à jour
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Middleware pour vérifier que l'utilisateur est administrateur
 * @param req - Requête entrante
 * @returns Réponse d'erreur ou undefined pour continuer
 */
export async function adminMiddleware(req: NextRequest) {
  // D'abord, vérifier l'authentification
  const authResult = await authMiddleware(req);
  
  // Si l'authentification a échoué, retourner le résultat
  if (authResult instanceof NextResponse && authResult.status !== 200) {
    return authResult;
  }
  
  // Récupérer le rôle de l'utilisateur depuis les en-têtes
  const userRole = req.headers.get('x-user-role');
  
  // Vérifier que l'utilisateur est administrateur
  if (userRole !== Role.ADMIN) {
    return NextResponse.json(
      { error: 'Accès refusé. Vous devez être administrateur pour accéder à cette ressource.' },
      { status: 403 }
    );
  }
  
  // Tout est OK, autoriser la requête
  return NextResponse.next();
}

/**
 * Helper pour obtenir l'ID de l'utilisateur à partir de la requête
 * @param req - Requête entrante
 * @returns ID de l'utilisateur ou null
 */
export function getUserIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

/**
 * Helper pour obtenir le rôle de l'utilisateur à partir de la requête
 * @param req - Requête entrante
 * @returns Rôle de l'utilisateur ou null
 */
export function getUserRoleFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-role');
}
