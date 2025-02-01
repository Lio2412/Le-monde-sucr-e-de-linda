import { AuthService } from '../services/authService';
import { prisma } from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import { Client } from 'pg';

// Mock pour pg Client
jest.mock('pg', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    query: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined)
  };
  return { Client: jest.fn(() => mockClient) };
});

// Mock pour Prisma
jest.mock('../config/database', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    role: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    userRole: {
      create: jest.fn()
    },
    $transaction: jest.fn()
  };

  mockPrisma.$transaction.mockImplementation(async (callback) => {
    if (typeof callback === 'function') {
      return callback(mockPrisma);
    }
    return Promise.resolve(callback);
  });

  return { prisma: mockPrisma };
});

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    nom: 'Test',
    prenom: 'User',
    pseudo: 'testuser',
    roles: [
      {
        role: {
          id: '1',
          nom: 'USER',
          description: 'Utilisateur standard'
        }
      }
    ]
  };

  const mockRole = {
    id: '1',
    nom: 'USER',
    description: 'Utilisateur standard',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();

    // Configuration des mocks par défaut
    (prisma.role.findFirst as jest.Mock).mockResolvedValue(mockRole);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
    (prisma.userRole.create as jest.Mock).mockResolvedValue({
      userId: mockUser.id,
      roleId: mockRole.id
    });
    (prisma.user.findUnique as jest.Mock).mockImplementation((params) => {
      if (params.include) {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    });
  });

  describe('register', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'testuser'
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // Pour la vérification de l'email
        .mockResolvedValueOnce(null); // Pour la vérification du pseudo

      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
      (jwt.sign as jest.Mock).mockReturnValueOnce('mockToken');

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async () => {
        return {
          ...mockUser,
          roles: [
            {
              role: mockRole
            }
          ]
        };
      });

      const result = await authService.register(registerData);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, expect.any(Number));
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('email', registerData.email);
    });

    it('devrait retourner une erreur si l\'email existe déjà', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'testuser'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow('Cet email est déjà utilisé');
    });

    it('devrait retourner une erreur si le pseudo existe déjà', async () => {
      const registerData = {
        email: 'new@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'testuser'
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow('Ce pseudo est déjà utilisé');
    });

    it('devrait retourner une erreur si le rôle USER n\'existe pas et ne peut pas être créé', async () => {
      const registerData = {
        email: 'new@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        pseudo: 'newuser'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.role.create as jest.Mock).mockRejectedValue(new Error('Le rôle USER est invalide'));

      await expect(authService.register(registerData)).rejects.toThrow('Impossible de gérer le rôle USER');
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec succès', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        roles: [{ role: { nom: 'USER' } }]
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (jwt.sign as jest.Mock).mockReturnValueOnce('mockToken');

      const result = await authService.login(loginData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
        include: { roles: { include: { role: true } } }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('email', loginData.email);
    });

    it('devrait retourner une erreur si l\'utilisateur n\'existe pas', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(authService.login(loginData)).rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('devrait retourner une erreur si le mot de passe est incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(authService.login(loginData)).rejects.toThrow('Email ou mot de passe incorrect');
    });
  });

  describe('getCurrentUser', () => {
    it('devrait retourner l\'utilisateur actuel', async () => {
      const userId = '1';

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await authService.getCurrentUser(userId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { roles: { include: { role: true } } }
      });
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).not.toHaveProperty('password');
    });

    it('devrait retourner une erreur si l\'utilisateur n\'existe pas', async () => {
      const userId = '999';

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(authService.getCurrentUser(userId)).rejects.toThrow('Utilisateur non trouvé');
    });
  });

  describe('generateToken', () => {
    it('devrait générer un token JWT valide', () => {
      const userId = '1';
      const mockToken = 'mockToken';

      (jwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

      const token = authService.generateToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
      expect(token).toBe(mockToken);
    });
  });
}); 