import { prisma } from '../utils/prisma';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { LoginData, LoginResponse, RegisterData, SafeUser } from '../models/auth.models';
import { Role } from '../types/prisma';

/**
 * Service d'authentification pour gérer les opérations liées aux utilisateurs
 */
export class AuthService {
  /**
   * Créer un nouvel utilisateur
   * @param userData - Données d'inscription
   * @returns L'utilisateur créé sans le mot de passe
   */
  async register(userData: RegisterData): Promise<SafeUser> {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cette adresse email existe déjà');
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(userData.password);

    // Créer l'utilisateur dans la base de données
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: Role.USER // Rôle par défaut
      }
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authentifier un utilisateur
   * @param loginData - Données de connexion
   * @returns L'utilisateur authentifié et son token
   */
  async login(loginData: LoginData): Promise<LoginResponse> {
    // Récupérer l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: loginData.email }
    });

    if (!user) {
      throw new Error('Identifiants invalides');
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      throw new Error('Ce compte a été désactivé');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Identifiants invalides');
    }

    // Générer un token JWT
    const token = generateToken(user);

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * Récupérer un utilisateur par son ID
   * @param userId - ID de l'utilisateur
   * @returns L'utilisateur sans le mot de passe
   */
  async getUserById(userId: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Vérifier si un utilisateur est administrateur
   * @param userId - ID de l'utilisateur
   * @returns Boolean indiquant si l'utilisateur est administrateur
   */
  async isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    return user?.role === Role.ADMIN;
  }
}

// Exporter une instance du service d'authentification
export const authService = new AuthService();
