import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur de test
  const user = await prisma.user.create({
    data: {
      name: 'Linda',
      email: 'linda@example.com',
    },
  });

  // Créer une recette de test
  const recipe = await prisma.recipe.create({
    data: {
      title: 'Gâteau au Chocolat',
      slug: 'gateau-au-chocolat',
      description: 'Un délicieux gâteau au chocolat moelleux et facile à réaliser',
      imageUrl: '/images/gateau-chocolat.jpg',
      ingredients: {
        create: [
          { name: 'Chocolat noir', quantity: '200', unit: 'g' },
          { name: 'Beurre', quantity: '200', unit: 'g' },
          { name: 'Sucre', quantity: '200', unit: 'g' },
          { name: 'Farine', quantity: '100', unit: 'g' },
          { name: 'Oeufs', quantity: '4', unit: 'unités' },
        ],
      },
      steps: {
        create: [
          { order: 1, description: 'Préchauffer le four à 180°C' },
          { order: 2, description: 'Faire fondre le chocolat et le beurre au bain-marie' },
          { order: 3, description: 'Mélanger le sucre, les oeufs et la farine' },
          { order: 4, description: 'Incorporer le mélange chocolat-beurre' },
          { order: 5, description: 'Cuire 25 minutes au four' },
        ],
      },
      comments: {
        create: [
          {
            content: 'Super recette !',
            userId: user.id,
          },
        ],
      },
    },
  });

  // Créer une deuxième recette de test
  const recipe2 = await prisma.recipe.create({
    data: {
      title: 'Tarte au citron meringuée',
      slug: 'tarte-au-citron-meringuée',
      description: 'Une délicieuse tarte au citron meringuée, acidulée et fondante',
      imageUrl: '/images/tarte-citron-meringuee.jpg',
      ingredients: {
        create: [
          { name: 'Pâte sablée', quantity: '1', unit: 'unité' },
          { name: 'Citrons jaunes', quantity: '4', unit: 'unités' },
          { name: 'Sucre', quantity: '150', unit: 'g' },
          { name: 'Beurre', quantity: '100', unit: 'g' },
          { name: 'Oeufs', quantity: '3', unit: 'unités' },
        ],
      },
      steps: {
        create: [
          { order: 1, description: 'Préchauffer le four à 180°C' },
          { order: 2, description: 'Etaler la pâte dans un moule, piquer le fond' },
          { order: 3, description: 'Préparer la crème de citron avec les citrons, le sucre, le beurre et les oeufs' },
          { order: 4, description: 'Verser sur le fond de tarte et cuire 20 minutes' },
          { order: 5, description: 'Préparer la meringue avec le sucre et les blancs d\'oeufs' },
          { order: 6, description: 'Recouvrir la tarte de meringue et poursuivre la cuisson 10 minutes' },
        ],
      },
    },
  });

  console.log({ user, recipe, recipe2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 