import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/constants.js';

const prisma = new PrismaClient();

interface User {
  id: string;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  pseudo: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  roles: UserRole[];
}

interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

interface Role {
  id: string;
  nom: string;
  description: string | null;
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
  user: Omit<User, 'password'>;
  token: string;
}

class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Vérifier si le pseudo existe déjà
    const existingPseudo = await prisma.user.findUnique({
      where: { pseudo: data.pseudo }
    });

    if (existingPseudo) {
      throw new Error('Ce pseudo est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { nom: 'USER' },
                create: { nom: 'USER', description: 'Utilisateur standard' }
              }
            }
          }
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Générer le token JWT
    const token = this.generateToken(user.id);

    // Retourner l'utilisateur sans le mot de passe et le token
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as Omit<User, 'password'>, token };
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(data: LoginData): Promise<AuthResponse> {
    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
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
    return { user: userWithoutPassword as Omit<User, 'password'>, token };
  }

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  /**
   * Générer un token JWT
   */
  private generateToken(userId: string): string {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign({ userId }, JWT_SECRET as jwt.Secret, options);
  }
}

export const authService = new AuthService(); 