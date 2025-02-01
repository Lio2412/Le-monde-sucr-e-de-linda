import { AuthService } from '../../services/authService';
import { prisma } from '../../config/database';
import { getDatabaseStatus, prepareTest, cleanupTests } from '../integration.setup';
import { User, Role } from '@prisma/client';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import crypto from 'crypto';

describe('AuthService - Tests d\'intégration', () => {
  let authService: AuthService;
  let userRoleId: string;

  beforeAll(async () => {
    // Initialiser la base de données de test
    try {
      // Nettoyer la base de données
      await prisma.userRole.deleteMany();
      await prisma.user.deleteMany();
      await prisma.role.deleteMany();

      // Créer le rôle USER avec un ID fixe pour les tests
      const userRole = await prisma.role.create({
        data: {
          id: '00000000-0000-0000-0000-000000000001',
          nom: 'USER',
          description: 'Utilisateur standard'
        }
      });

      userRoleId = userRole.id;
      
      // Vérifier que le rôle a bien été créé
      const roleCheck = await prisma.role.findUnique({
        where: { id: userRoleId }
      });
      
      if (!roleCheck) {
        throw new Error('Échec de la création du rôle USER');
      }

      console.log('Rôle USER créé avec succès:', roleCheck);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des tests:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      authService = new AuthService();
      // Nettoyer uniquement les données utilisateur avant chaque test
      await prisma.userRole.deleteMany();
      await prisma.user.deleteMany();
      
      // Vérifier que le rôle USER existe toujours
      const roleCheck = await prisma.role.findUnique({
        where: { id: userRoleId }
      });
      
      if (!roleCheck) {
        console.error('Le rôle USER n\'existe pas avant le test');
        throw new Error('Le rôle USER n\'existe pas avant le test');
      }

      console.log('Rôle USER vérifié avant le test:', roleCheck);
    } catch (error) {
      console.error('Erreur lors de la préparation du test:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Nettoyer la base de données
      await prisma.userRole.deleteMany();
      await prisma.user.deleteMany();
      await prisma.role.deleteMany();
      await prisma.$disconnect();
    } catch (error) {
      console.error('Erreur lors du nettoyage final:', error);
      throw error;
    }
  });

  describe('register', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'testuser'
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('email', userData.email);
      expect(result.user).toHaveProperty('nom', userData.nom);
      expect(result.user).not.toHaveProperty('password');

      // Vérifier que l'utilisateur existe dans la base de données
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { roles: { include: { role: true } } }
      });

      expect(user).toBeTruthy();
      expect(user?.roles).toHaveLength(1);
      expect(user?.roles[0].role.nom).toBe('USER');
    });

    it('devrait retourner une erreur si l\'email existe déjà', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'uniquepseudo'
      };

      // Créer un premier utilisateur
      await authService.register(userData);

      // Tenter de créer un deuxième utilisateur avec le même email
      await expect(authService.register({
        ...userData,
        pseudo: 'differentpseudo'
      })).rejects.toThrow('Cet email est déjà utilisé');
    });

    it('devrait retourner une erreur si le pseudo existe déjà', async () => {
      const userData = {
        email: 'unique@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'duplicatepseudo'
      };

      // Créer un premier utilisateur
      await authService.register(userData);

      // Tenter de créer un deuxième utilisateur avec le même pseudo
      await expect(authService.register({
        ...userData,
        email: 'different@example.com'
      })).rejects.toThrow('Ce pseudo est déjà utilisé');
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec succès', async () => {
      const userData = {
        email: 'login@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'loginuser'
      };

      // Créer un utilisateur
      await authService.register(userData);

      // Tenter de se connecter
      const result = await authService.login({
        email: userData.email,
        password: userData.password
      });

      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('email', userData.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('devrait retourner une erreur si l\'email n\'existe pas', async () => {
      await expect(authService.login({
        email: 'nonexistent@example.com',
        password: 'password123'
      })).rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('devrait retourner une erreur si le mot de passe est incorrect', async () => {
      const userData = {
        email: 'wrongpass@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'wrongpassuser'
      };

      // Créer un utilisateur
      await authService.register(userData);

      // Tenter de se connecter avec un mauvais mot de passe
      await expect(authService.login({
        email: userData.email,
        password: 'wrongpassword'
      })).rejects.toThrow('Email ou mot de passe incorrect');
    });
  });

  describe('getCurrentUser', () => {
    it('devrait retourner l\'utilisateur actuel', async () => {
      const userData = {
        email: 'current@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'currentuser'
      };

      // Créer un utilisateur
      const { user } = await authService.register(userData);

      // Récupérer l'utilisateur
      const currentUser = await authService.getCurrentUser(user.id);

      expect(currentUser).toHaveProperty('email', userData.email);
      expect(currentUser).not.toHaveProperty('password');
      expect(currentUser.roles).toHaveLength(1);
      expect(currentUser.roles[0].role.nom).toBe('USER');
    });

    it('devrait retourner une erreur si l\'utilisateur n\'existe pas', async () => {
      await expect(authService.getCurrentUser('nonexistentid')).rejects.toThrow('Utilisateur non trouvé');
    });
  });
}); 