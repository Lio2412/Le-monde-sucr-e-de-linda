import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Création des rôles
  const roleAdmin = await prisma.role.upsert({
    where: { nom: 'admin' },
    update: {},
    create: {
      nom: 'admin',
      description: 'Administrateur du site'
    },
  });

  const roleUser = await prisma.role.upsert({
    where: { nom: 'user' },
    update: {},
    create: {
      nom: 'user',
      description: 'Utilisateur standard'
    },
  });

  const rolePatissier = await prisma.role.upsert({
    where: { nom: 'patissier' },
    update: {},
    create: {
      nom: 'patissier',
      description: 'Pâtissier professionnel'
    },
  });

  // Création des utilisateurs de test
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      nom: 'Admin',
      prenom: 'Super',
      pseudo: 'superadmin',
      password: await bcryptjs.hash('Admin123!', 10),
      roles: {
        create: [
          { roleId: roleAdmin.id },
          { roleId: roleUser.id }
        ]
      }
    },
  });

  const standardUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: await bcryptjs.hash('User123!', 10),
      nom: 'Utilisateur',
      prenom: 'Standard',
      pseudo: 'usertest',
      roles: {
        create: [
          { roleId: roleUser.id }
        ]
      }
    },
  });

  const patissierUser = await prisma.user.upsert({
    where: { email: 'patissier@test.com' },
    update: {},
    create: {
      email: 'patissier@test.com',
      password: await bcryptjs.hash('Patissier123!', 10),
      nom: 'Dupont',
      prenom: 'Jean',
      pseudo: 'jeandupont',
      roles: {
        create: [
          { roleId: rolePatissier.id },
          { roleId: roleUser.id }
        ]
      }
    },
  });

  console.log({ adminUser, standardUser, patissierUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 