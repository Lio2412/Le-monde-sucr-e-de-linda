import request from 'supertest';
import { app } from '@/app';
import { mockCtx } from '../setup/backend.jest.setup';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

describe('Auth Integration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('devrait retourner une erreur si l\'email existe déjà', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Existing',
        lastName: 'User',
      };

      await prisma.user.create({
        data: {
          ...userData,
          password: await bcrypt.hash(userData.password, 10),
        },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur existant', async () => {
      const userData = {
        email: 'login@example.com',
        password: 'Password123!',
        firstName: 'Login',
        lastName: 'User',
      };

      await prisma.user.create({
        data: {
          ...userData,
          password: await bcrypt.hash(userData.password, 10),
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', userData.email);
    });

    it('devrait retourner une erreur avec des identifiants invalides', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('devrait retourner les informations de l\'utilisateur connecté', async () => {
      const userData = {
        email: 'me@example.com',
        password: 'Password123!',
        firstName: 'Me',
        lastName: 'User',
      };

      const user = await prisma.user.create({
        data: {
          ...userData,
          password: await bcrypt.hash(userData.password, 10),
        },
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user).toHaveProperty('email', userData.email);
    });

    it('devrait retourner une erreur sans token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 