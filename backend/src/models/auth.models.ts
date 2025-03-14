import { z } from 'zod';

/**
 * Type pour les données utilisateur exposées via l'API (sans mot de passe)
 */
export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  isActive: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

/**
 * Type pour les données d'inscription
 */
export type RegisterData = z.infer<typeof registerSchema>;

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

/**
 * Type pour les données de connexion
 */
export type LoginData = z.infer<typeof loginSchema>;

/**
 * Type pour la réponse de connexion
 */
export interface LoginResponse {
  user: SafeUser;
  token: string;
}

/**
 * Type pour les informations d'authentification
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string; // "USER" ou "ADMIN"
  iat?: number;
  exp?: number;
} 