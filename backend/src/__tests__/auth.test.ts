import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../lib/prisma.js';

describe('Tests d\'authentification', () => {
  beforeAll(async () => {
    // Nettoyer la base de données avant les tests
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Nettoyer la base de données après les tests
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    nom: 'Test',
    prenom: 'User',
    pseudo: 'testuser'
  };

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
    });

    it('devrait retourner une erreur si l\'email existe déjà', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Cet email est déjà utilisé');
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur existant', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('devrait retourner une erreur si les identifiants sont incorrects', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    });
  });

  describe('GET /api/auth/me', () => {
    it('devrait retourner le profil de l\'utilisateur connecté', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email }
      });

      const token = jwt.sign(
        { userId: user?.id },
        process.env.JWT_SECRET || 'test_secret_key',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user?.id);
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('devrait retourner une erreur si le token est invalide', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token invalide');
    });
  });
}); 