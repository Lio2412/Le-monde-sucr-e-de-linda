import { NextRequest } from 'next/server';
import { handleLogin } from '../../../../auth/handlers';

/**
 * Route API pour la connexion d'un utilisateur
 * Méthode: POST
 * Endpoint: /api/auth/login
 */
export async function POST(req: NextRequest) {
  return handleLogin(req);
} 