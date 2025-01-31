import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/ValidationError.js';
import config from '../config/config.js';

export const errorHandler = (
  err: Error | ValidationError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    res.status(400).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      status: 'error',
      message: 'Non autorisé'
    });
    return;
  }

  if (err.name === 'NotFoundError') {
    res.status(404).json({
      status: 'error',
      message: err.message || 'Ressource non trouvée'
    });
    return;
  }

  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Une erreur est survenue sur le serveur.',
    error: config.NODE_ENV === 'development' ? err.message : undefined
  });
}; 