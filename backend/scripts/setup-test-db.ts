import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

async function setupTestDatabase() {
  try {
    // Nettoyer la base de données
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    // Créer le rôle par défaut
    await prisma.role.create({
      data: {
        nom: 'USER',
        description: 'Utilisateur standard'
      }
    });

    console.log('✅ Base de données de test configurée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la configuration de la base de données de test:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDatabase(); 