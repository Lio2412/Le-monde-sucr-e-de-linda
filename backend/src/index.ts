import express, { Request, Response } from 'express';
import cors from 'cors';
import { authService } from './auth/auth.service';
import { prisma } from './utils/prisma';
import { hashPassword } from './utils/auth';
import { Role } from './types/prisma';
import adminRoutes from './routes/admin.routes';
import path from 'path';
import { authRoutes } from './routes/auth.routes';

const app = express();
const port = process.env.PORT || 5001;

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5003',
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging des requêtes pour le débogage
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    console.log('Tentative de connexion:', req.body);
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    console.log('Connexion réussie pour:', email);
    res.json(result);
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    res.status(401).json({ error: error.message || 'Erreur lors de la connexion' });
  }
});

// Utiliser les routes admin
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/status', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Le serveur fonctionne correctement' });
});

/**
 * Point d'entrée du backend pour initialiser les services et les données
 */
async function main() {
  console.log('Initialisation du backend...');

  // Vérifier si l'utilisateur admin existe déjà
  const adminExists = await prisma.user.findFirst({
    where: { role: Role.ADMIN }
  });

  // Créer un utilisateur admin par défaut si aucun n'existe
  if (!adminExists) {
    console.log('Création de l\'utilisateur admin par défaut...');
    
    const hashedPassword = await hashPassword('Admin123!');
    
    await prisma.user.create({
      data: {
        name: 'Administrateur',
        email: 'admin@lemondesucre.fr',
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true
      }
    });
    
    console.log('Utilisateur admin créé avec succès !');
  }

  // Démarrer le serveur
  app.listen(port, () => {
    console.log(`Backend initialisé avec succès et en écoute sur le port ${port} !`);
    console.log(`- URL de l'API: http://localhost:${port}/api`);
    console.log('- Service d\'authentification prêt.');
  });
}

// Exécuter la fonction principale
main()
  .catch((error) => {
    console.error('Erreur lors de l\'initialisation du backend:', error);
    process.exit(1);
  })
  .finally(async () => {
    // Fermer la connexion Prisma
    await prisma.$disconnect();
  });

// Exporter les services pour utilisation dans d'autres parties de l'application
export { authService }; 