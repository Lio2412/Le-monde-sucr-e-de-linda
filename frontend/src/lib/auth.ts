import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import { User, UserRole, JwtPayload } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'UzSnDSiSBV68c2bKmb61Vf3W2ZRJGMF3PcF6KNcff3segMvrnD1Q0E7H746PJ+FohucizXsjea761j/o7mKLhA==';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export { UserRole };

/**
 * Hache un mot de passe
 * @param password Mot de passe en clair
 * @returns Mot de passe haché
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

/**
 * Vérifie si un mot de passe correspond au hash
 * @param password Mot de passe en clair
 * @param hashedPassword Mot de passe haché
 * @returns True si le mot de passe est valide
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Authentifie un utilisateur avec email et mot de passe
 * @param email Email de l'utilisateur
 * @param password Mot de passe de l'utilisateur
 * @returns Informations utilisateur et token JWT
 */
export async function authenticateUser(email: string, password: string): Promise<{ user: User; token: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur d\'authentification');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    throw error;
  }
}

/**
 * Inscrit un nouvel utilisateur
 * @param name Nom de l'utilisateur
 * @param email Email de l'utilisateur
 * @param password Mot de passe de l'utilisateur
 * @returns Informations utilisateur créé
 */
export async function registerUser(name: string, email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'inscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
}

/**
 * Récupère le profil de l'utilisateur connecté
 * @param token Token JWT de l'utilisateur
 * @returns Informations de l'utilisateur
 */
export async function getUserProfile(token: string) {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération du profil');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
}

/**
 * Vérifie si un utilisateur est administrateur
 * @param token Token JWT de l'utilisateur
 * @returns True si l'utilisateur est administrateur
 */
export async function isAdmin(token: string): Promise<boolean> {
  try {
    const user = await getUserProfile(token);
    return user.role === UserRole.ADMIN;
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle administrateur:', error);
    return false;
  }
}

/**
 * Vérifie un token JWT et retourne le payload décodé
 * @param token Le token JWT à vérifier
 * @returns Le payload décodé ou null si le token est invalide
 */
export const verifyJwtToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    if (!token) return null;
    
    // Utiliser jose qui est compatible avec Edge Runtime
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(JWT_SECRET);
    
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    // Convertir explicitement en objet JwtPayload
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      // Ajouter d'autres champs si nécessaire
    } as JwtPayload;
  } catch (error) {
    console.error('Erreur lors de la vérification du token JWT:', error);
    return null;
  }
};

/**
 * Génère un token JWT pour un utilisateur
 * @param payload Les données à inclure dans le token
 * @returns Le token JWT généré
 */
export const generateJwtToken = async (payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> => {
  // Utiliser jose au lieu de jsonwebtoken pour la génération
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(JWT_SECRET);
  
  const token = await new jose.SignJWT(payload as Record<string, any>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
  
  return token;
};
