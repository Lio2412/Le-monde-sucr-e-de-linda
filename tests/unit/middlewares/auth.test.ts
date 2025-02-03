import { authMiddleware } from '@/middlewares/auth';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn()
}));

describe('Auth Middleware', () => {
  const mockGetToken = getToken as jest.Mock;
  
  beforeEach(() => {
    mockGetToken.mockClear();
  });

  const createMockRequest = (path: string) => {
    return new NextRequest(new URL(`http://localhost${path}`), {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  };

  it('allows access to public routes', async () => {
    const publicPaths = ['/', '/login', '/register', '/recettes', '/api/auth/signin'];
    
    for (const path of publicPaths) {
      const request = createMockRequest(path);
      const response = await authMiddleware(request);
      expect(response).toBeUndefined();
    }
  });

  it('allows access to static files', async () => {
    const staticPaths = [
      '/_next/static/chunk.js',
      '/images/recipe.jpg',
      '/favicon.ico'
    ];
    
    for (const path of staticPaths) {
      const request = createMockRequest(path);
      const response = await authMiddleware(request);
      expect(response).toBeUndefined();
    }
  });

  it('redirects to login for protected routes when not authenticated', async () => {
    mockGetToken.mockResolvedValue(null);
    
    const protectedPaths = [
      '/dashboard',
      '/profil',
      '/recettes/creer',
      '/api/recettes/creer'
    ];
    
    for (const path of protectedPaths) {
      const request = createMockRequest(path);
      const response = await authMiddleware(request);
      
      expect(response?.status).toBe(307);
      expect(response?.headers.get('Location')).toBe('/login');
    }
  });

  it('allows access to protected routes when authenticated', async () => {
    mockGetToken.mockResolvedValue({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    const protectedPaths = [
      '/dashboard',
      '/profil',
      '/recettes/creer'
    ];
    
    for (const path of protectedPaths) {
      const request = createMockRequest(path);
      const response = await authMiddleware(request);
      expect(response).toBeUndefined();
    }
  });

  it('returns 401 for protected API routes when not authenticated', async () => {
    mockGetToken.mockResolvedValue(null);
    
    const protectedApiPaths = [
      '/api/recettes/creer',
      '/api/utilisateurs/profil',
      '/api/commentaires/ajouter'
    ];
    
    for (const path of protectedApiPaths) {
      const request = createMockRequest(path);
      const response = await authMiddleware(request);
      
      expect(response?.status).toBe(401);
      const responseBody = await response?.json();
      expect(responseBody).toEqual({
        error: 'Non autorisé'
      });
    }
  });

  it('handles malformed URLs gracefully', async () => {
    const request = new NextRequest(new URL('http://localhost/invalid path'));
    const response = await authMiddleware(request);
    expect(response?.status).toBe(400);
  });

  it('preserves query parameters in redirects', async () => {
    mockGetToken.mockResolvedValue(null);
    
    const request = createMockRequest('/dashboard?redirect=/recettes/123');
    const response = await authMiddleware(request);
    
    expect(response?.headers.get('Location')).toBe(
      '/login?redirect=/dashboard?redirect=/recettes/123'
    );
  });

  it('handles OPTIONS requests for CORS', async () => {
    const request = new NextRequest(new URL('http://localhost/api/recettes'), {
      method: 'OPTIONS'
    });
    
    const response = await authMiddleware(request);
    expect(response).toBeUndefined();
  });
});
