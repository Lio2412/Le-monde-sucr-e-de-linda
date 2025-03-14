import { NextRequest } from 'next/server';
import { handleRegister } from '../handlers';

/**
 * Route API pour l'inscription d'un nouvel utilisateur
 * Méthode: POST
 * Endpoint: /api/auth/register
 */
export async function POST(req: NextRequest) {
  return handleRegister(req);
}
