import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Middleware pour logger les requêtes (debug)
router.use((req, res, next) => {
  console.log('Auth Route:', req.method, req.path);
  console.log('Request Body:', req.body);
  next();
});

// Route POST /login
router.post('/login', async (req, res) => {
  try {
    console.log('Tentative de connexion avec:', req.body);
    const { email, motDePasse } = req.body;

    // Recherche de l'utilisateur dans la base de données
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérification du mot de passe
    const isValidPassword = await compare(motDePasse, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Création du token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        roles: user.roles.map(r => r.role.nom)
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Envoi de la réponse
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          pseudo: user.pseudo,
          roles: user.roles.map(r => ({
            role: {
              nom: r.role.nom,
              description: r.role.description
            }
          }))
        },
        token
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

export default router; 