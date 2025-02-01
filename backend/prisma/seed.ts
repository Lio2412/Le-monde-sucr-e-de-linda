/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Créer le rôle admin s'il n'existe pas
  const adminRole = await prisma.role.upsert({
    where: { nom: 'admin' },
    update: {},
    create: {
      nom: 'admin',
      description: 'Administrateur du site'
    }
  });

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // Créer l'utilisateur admin s'il n'existe pas
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      nom: 'Admin',
      prenom: 'Super',
      pseudo: 'superadmin',
      roles: {
        create: {
          role: {
            connect: {
              id: adminRole.id
            }
          }
        }
      }
    }
  });

  console.log('Base de données initialisée avec succès !');
  console.log('Admin créé:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 