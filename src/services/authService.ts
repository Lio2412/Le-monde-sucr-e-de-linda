import { PrismaClient, User as PrismaUser, Role as PrismaRole, UserRole as PrismaUserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from '../config/constants';
import { prisma } from '../config/database';
import crypto from 'crypto';

interface User extends PrismaUser {
  roles: (PrismaUserRole & {
    role: PrismaRole;
  })[];
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
    try {
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
      const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

      // Créer l'utilisateur avec le rôle dans une transaction
      const result = await prisma.$transaction(async (tx) => {
        // Récupérer le rôle USER avec l'ID fixe
        const userRole = await tx.role.findUnique({
          where: { id: '00000000-0000-0000-0000-000000000001' }
        });

        if (!userRole || !userRole.id) {
          console.error('Le rôle USER est introuvable');
          throw new Error('Le rôle USER est invalide');
        }

        // Créer l'utilisateur
        const newUser = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            nom: data.nom,
            prenom: data.prenom,
            pseudo: data.pseudo,
            roles: {
              create: {
                roleId: userRole.id
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

        return newUser;
      });

      if (!result) {
        throw new Error('Échec de la création de l\'utilisateur');
      }

      // Générer le token JWT
      const token = this.generateToken(result.id);

      // Retourner l'utilisateur sans le mot de passe et le token
      const { password, ...userWithoutPassword } = result;
      return { user: userWithoutPassword as Omit<User, 'password'>, token };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur est survenue lors de la création de l\'utilisateur');
    }
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
  generateToken(userId: string): string {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign({ userId }, JWT_SECRET, options);
  }
}

export { AuthService };
export const authService = new AuthService(); 