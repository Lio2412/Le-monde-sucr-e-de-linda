import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import recipesRouter from './routes/recipes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log toutes les requêtes
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Route de test
app.get('/test', (_req: Request, res: Response) => {
  res.json({ message: 'API is working' });
});

app.use('/api/recipes', recipesRouter);

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}`);
}).on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} déjà utilisé, tentative avec le port ${PORT + 1}`);
    server.close();
    app.listen(PORT + 1);
  } else {
    console.error('Erreur serveur:', error);
  }
}); 