import { createMockContext, MockContext } from '../../setup/backend.jest.setup';
import { AuthService } from '../../../backend/src/services/auth.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let mockCtx: MockContext;
let ctx: { prisma: PrismaClient };
let authService: AuthService;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as any;
  authService = new AuthService(ctx.prisma);
});

describe('AuthService', () => {
  describe('inscription', () => {
    const userData = {
      email: 'test@example.com',
      motDePasse: 'Password123!',
      nom: 'Test User'
    };

    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const hashedPassword = 'hashedPassword123';
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(hashedPassword);

      mockCtx.prisma.utilisateur.create.mockResolvedValueOnce({
        id: 1,
        ...userData,
        motDePasse: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await authService.inscription(userData);

      expect(result).toEqual({
        id: 1,
        email: userData.email,
        nom: userData.nom
      });

      expect(mockCtx.prisma.utilisateur.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          motDePasse: hashedPassword
        }
      });
    });

    it('devrait échouer si l\'email existe déjà', async () => {
      mockCtx.prisma.utilisateur.findUnique.mockResolvedValueOnce({
        id: 1,
        ...userData,
        motDePasse: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(authService.inscription(userData)).rejects.toThrow(
        'Un utilisateur avec cet email existe déjà'
      );
    });
  });

  describe('connexion', () => {
    const credentials = {
      email: 'test@example.com',
      motDePasse: 'Password123!'
    };

    it('devrait connecter un utilisateur avec succès', async () => {
      const user = {
        id: 1,
        email: credentials.email,
        motDePasse: 'hashedPassword',
        nom: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCtx.prisma.utilisateur.findUnique.mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      jest.spyOn(jwt, 'sign').mockReturnValueOnce('token123');

      const result = await authService.connexion(credentials);

      expect(result).toEqual({
        token: 'token123',
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom
        }
      });
    });

    it('devrait échouer si l\'utilisateur n\'existe pas', async () => {
      mockCtx.prisma.utilisateur.findUnique.mockResolvedValueOnce(null);

      await expect(authService.connexion(credentials)).rejects.toThrow(
        'Email ou mot de passe incorrect'
      );
    });

    it('devrait échouer si le mot de passe est incorrect', async () => {
      mockCtx.prisma.utilisateur.findUnique.mockResolvedValueOnce({
        id: 1,
        email: credentials.email,
        motDePasse: 'hashedPassword',
        nom: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(authService.connexion(credentials)).rejects.toThrow(
        'Email ou mot de passe incorrect'
      );
    });
  });

  describe('verifierToken', () => {
    it('devrait retourner les informations de l\'utilisateur pour un token valide', async () => {
      const token = 'valid_token';
      const decodedToken = { id: 1 };
      const user = {
        id: 1,
        email: 'test@example.com',
        nom: 'Test User',
        motDePasse: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(jwt, 'verify').mockReturnValueOnce(decodedToken);
      mockCtx.prisma.utilisateur.findUnique.mockResolvedValueOnce(user);

      const result = await authService.verifierToken(token);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        nom: user.nom
      });
    });

    it('devrait échouer si le token est invalide', async () => {
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error('Token invalide');
      });

      await expect(authService.verifierToken('invalid_token')).rejects.toThrow(
        'Token invalide'
      );
    });

    it('devrait échouer si l\'utilisateur n\'existe pas', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValueOnce({ id: 999 });
      mockCtx.prisma.utilisateur.findUnique.mockResolvedValueOnce(null);

      await expect(authService.verifierToken('valid_token')).rejects.toThrow(
        'Utilisateur non trouvé'
      );
    });
  });
}); 