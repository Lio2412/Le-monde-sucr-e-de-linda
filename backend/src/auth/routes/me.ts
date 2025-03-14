import { NextRequest } from 'next/server';
import { handleGetMe } from '../handlers';
import { authMiddleware } from '../../middleware/auth.middleware';

/**
 * Route API pour récupérer le profil de l'utilisateur connecté
 * Méthode: GET
 * Endpoint: /api/auth/me
 * Nécessite d'être authentifié
 */
export async function GET(req: NextRequest) {
  // Vérifier l'authentification
  const authResult = await authMiddleware(req);
  if (authResult) {
    return authResult;
  }
  
  return handleGetMe(req);
}
