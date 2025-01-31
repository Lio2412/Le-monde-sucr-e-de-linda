import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../auth.middleware';

jest.mock('../../prisma/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock('jsonwebtoken');

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

  it('should handle multiple authorization headers correctly', async () => {
    mockReq.headers = {
      authorization: 'Bearer token1'
    };

    await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token invalide'
    });
  });

  it('devrait retourner 401 si aucun token n\'est fourni', () => {
    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Accès non autorisé. Token manquant.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('devrait retourner 401 si le format du token est invalide', () => {
    mockReq.headers = {
      authorization: 'Invalid Token'
    };

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Format de token invalide.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('devrait retourner 401 si le token est invalide', () => {
    mockReq.headers = {
      authorization: 'Bearer invalid_token'
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Token invalide');
    });

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token invalide.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('devrait appeler next() si le token est valide', () => {
    mockReq.headers = {
      authorization: 'Bearer valid_token'
    };

    const decodedToken = { id: 'user123' };
    (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual(decodedToken);
  });

  it('devrait gérer les tokens expirés', () => {
    mockReq.headers = {
      authorization: 'Bearer expired_token'
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.TokenExpiredError('Token expiré', new Date());
    });

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token invalide.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('devrait gérer les tokens malformés', () => {
    mockReq.headers = {
      authorization: 'Bearer malformed_token'
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.JsonWebTokenError('Token malformé');
    });

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token invalide.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('devrait gérer les tokens avec une signature invalide', () => {
    mockReq.headers = {
      authorization: 'Bearer invalid_signature'
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.JsonWebTokenError('Signature invalide');
    });

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token invalide.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('devrait vérifier la présence de l\'ID utilisateur dans le token décodé', () => {
    mockReq.headers = {
      authorization: 'Bearer valid_token'
    };

    const decodedToken = {}; // Token sans ID utilisateur
    (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token invalide.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('devrait gérer les tokens avec des rôles', () => {
    mockReq.headers = {
      authorization: 'Bearer valid_token_with_roles'
    };

    const decodedToken = {
      id: 'user123'
    };
    (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual(decodedToken);
  });

  it('devrait gérer les erreurs inattendues lors de la vérification', () => {
    mockReq.headers = {
      authorization: 'Bearer valid_token'
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Erreur inattendue');
    });

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token invalide.'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
}); 