import { prisma } from './prisma';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function authenticateUser(email: string, password: string) {
  // Rechercher l'utilisateur
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
    throw new Error('Utilisateur non trouvé');
  }

  // Vérifier le mot de passe
  const isValid = await compare(password, user.password);
  if (!isValid) {
    throw new Error('Mot de passe incorrect');
  }

  // Vérifier si l'utilisateur est actif
  if (!user.isActive) {
    throw new Error('Compte désactivé');
  }

  // Créer le token JWT avec les informations de l'utilisateur
  const token = sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles.map(ur => ur.role.nom)
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      roles: user.roles.map(ur => ur.role.nom)
    },
    token
  };
}

export async function isAdmin(userId: string): Promise<boolean> {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId: userId
    },
    include: {
      role: true
    }
  });

  return userRoles.some(ur => ur.role.nom === 'ADMIN');
}
