import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { JwtPayload } from '../models/auth.models';

/**
 * Hache un mot de passe en utilisant bcrypt
 * @param password - Mot de passe en clair à hacher
 * @returns Mot de passe haché
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return hash(password, saltRounds);
}

/**
 * Vérifie si un mot de passe correspond au hash stocké
 * @param password - Mot de passe en clair à vérifier
 * @param hashedPassword - Hash du mot de passe stocké
 * @returns Boolean indiquant si le mot de passe est valide
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Génère un jeton JWT pour un utilisateur
 * @param user - Objet utilisateur pour lequel générer le token
 * @returns Jeton JWT généré
 */
export function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || 'UzSnDSiSBV68c2bKmb61Vf3W2ZRJGMF3PcF6KNcff3segMvrnD1Q0E7H746PJ+FohucizXsjea761j/o7mKLhA==';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

/**
 * Vérifie et décode un jeton JWT
 * @param token - Jeton JWT à vérifier
 * @returns Payload décodé ou null si invalide
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'UzSnDSiSBV68c2bKmb61Vf3W2ZRJGMF3PcF6KNcff3segMvrnD1Q0E7H746PJ+FohucizXsjea761j/o7mKLhA==';
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    console.error('Erreur lors de la vérification du token JWT:', error);
    return null;
  }
}

/**
 * Extrait le token JWT de l'en-tête d'autorisation
 * @param authHeader - En-tête d'autorisation
 * @returns Token extrait ou null si l'en-tête est invalide
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}
