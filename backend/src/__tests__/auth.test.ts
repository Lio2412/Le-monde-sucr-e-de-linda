import request from 'supertest';
import app from '../app';
import { prisma } from '../prisma/client';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middlewares/auth.middleware';

jest.mock('../prisma/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock('jsonwebtoken');

describe('Authentication API', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  test('POST /api/auth/register - should create new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test1234!'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /api/auth/register - should reject invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid-email', password: 'Test1234!' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/email valide/i);
  });

  test('POST /api/auth/login - should return JWT token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test1234!'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /api/auth/login - should block after 3 failed attempts', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'Wrong123!' });
    }

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Test1234!' });

    expect(response.status).toBe(429);
  });

  test('GET /api/auth/profile - should require valid JWT', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
  });

  test('JWT token should expire after 1h', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Test1234!' });

    const token = login.body.token;
  
    // Simuler expiration du token
    jest.spyOn(jwt, 'verify').mockImplementation(() => ({
      exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1h ago
    }));

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  // Test de validation de rôle administrateur
  test('Admin route requires admin role', async () => {
    // Créer utilisateur non-admin
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'Test1234!' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'Test1234!' });

    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(response.status).toBe(403);
  });

  // Test de dépassement de limite de taux
  // Test de validation de complexité de mot de passe
  // Test de token JWT expiré
  // Test de rôle utilisateur
});

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token d\'authentification manquant'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token format is invalid', async () => {
    mockReq.headers = {
      authorization: 'InvalidFormat token123'
    };

    await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Format du token invalide'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token verification fails', async () => {
    mockReq.headers = {
      authorization: 'Bearer invalidtoken'
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token invalide'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not found', async () => {
    mockReq.headers = {
      authorization: 'Bearer validtoken'
    };

    (jwt.verify as jest.Mock).mockImplementation(() => ({
      id: 'user123'
    }));

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Utilisateur non trouvé'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() if authentication is successful', async () => {
    mockReq.headers = {
      authorization: 'Bearer validtoken'
    };

    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User'
    };

    (jwt.verify as jest.Mock).mockImplementation(() => ({
      id: mockUser.id
    }));

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual(mockUser);
  });
});
