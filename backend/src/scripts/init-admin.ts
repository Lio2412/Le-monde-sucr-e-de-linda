import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (existingAdmin) {
      console.log('Un administrateur existe déjà');
      return;
    }

    // Créer l'administrateur
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('Administrateur créé avec succès:', admin.email);
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 