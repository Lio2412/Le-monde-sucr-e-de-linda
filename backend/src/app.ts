import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import { NODE_ENV } from './config/constants';

const app = express();

// Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Logging
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);

// Gestion des erreurs
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur interne est survenue'
  });
});

export { app }; 