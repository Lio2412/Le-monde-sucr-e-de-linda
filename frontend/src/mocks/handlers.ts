import { rest } from 'msw';
import type { TestUser, TestAuthResponse } from '@/types/test';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const mockUser: TestUser = {
  id: '1',
  email: 'test@test.com',
  nom: 'Test',
  prenom: 'User',
  pseudo: 'testuser',
  roles: [
    {
      role: {
        nom: 'user',
        description: 'Utilisateur standard',
      },
    },
  ],
};

export const handlers = [
  // Handler pour la connexion
  rest.post(`${API_URL}/auth/login`, async (req, res, ctx) => {
    const { email, password } = await req.json();

    if (email === 'test@test.com' && password === 'password123') {
      const response: TestAuthResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'fake-token',
        },
      };

      return res(
        ctx.status(200),
        ctx.json(response)
      );
    }

    const errorResponse: TestAuthResponse = {
      success: false,
      message: 'Email ou mot de passe incorrect',
    };

    return res(
      ctx.status(401),
      ctx.json(errorResponse)
    );
  }),

  // Handler pour getCurrentUser
  rest.get(`${API_URL}/auth/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');

    if (authHeader === 'Bearer fake-token') {
      const response: TestAuthResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'fake-token',
        },
      };

      return res(
        ctx.status(200),
        ctx.json(response)
      );
    }

    const errorResponse: TestAuthResponse = {
      success: false,
      message: 'Non authentifié',
    };

    return res(
      ctx.status(401),
      ctx.json(errorResponse)
    );
  }),
]; 