import { PrismaClient, User as PrismaUser } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from '../config/constants';
import { prisma } from '../config/database';

interface User extends Omit<PrismaUser, 'password'> {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  pseudo: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  pseudo: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('=== Debug AuthService Register ===');
    console.log('Input userData:', data);

    try {
      // Vérifier si l'email existe déjà
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email }
      });
      
      if (existingEmail) {
        console.log('Email déjà utilisé:', data.email);
        throw new Error('Cet email est déjà utilisé');
      }

      // Vérifier si le pseudo existe déjà
      const existingPseudo = await prisma.user.findUnique({
        where: { pseudo: data.pseudo }
      });
      
      if (existingPseudo) {
        console.log('Pseudo déjà utilisé:', data.pseudo);
        throw new Error('Ce pseudo est déjà utilisé');
      }

      // Hasher le mot de passe
      console.log('Hashage du mot de passe...');
      const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

      console.log('Création de l\'utilisateur...');
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          nom: data.nom,
          prenom: data.prenom,
          pseudo: data.pseudo
        }
      });
      console.log('Utilisateur créé:', user);

      // Générer le token JWT
      const token = this.generateToken(user.id);
      console.log('Generated token:', token);

      // Retourner l'utilisateur sans le mot de passe et le token
      const { password, ...userWithoutPassword } = user;
      const result = {
        user: userWithoutPassword,
        token
      };

      console.log('Service result:', result);
      return result;
    } catch (error) {
      console.error('AuthService Register error:', error);
      throw error;
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(data: LoginData): Promise<AuthResponse> {
    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Générer le token JWT
    const token = this.generateToken(user.id);

    // Retourner l'utilisateur sans le mot de passe et le token
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  async getCurrentUser(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Générer un token JWT
   */
  generateToken(userId: string): string {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign({ userId }, JWT_SECRET, options);
  }
}

export { AuthService };
export const authService = new AuthService();