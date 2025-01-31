import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.recipe.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: 'linda@example.com',
      name: 'Linda',
      password: 'password',
    },
  });

  await prisma.recipe.create({
    data: {
      slug: 'tarte-au-citron-meringuee',
      title: 'Tarte au citron meringuée',
      description: 'Une délicieuse tarte au citron meringuée, parfaite pour les amateurs de desserts acidulés !',
      mainImage: 'https://images.unsplash.com/photo-1565808229224-264b8f43d2b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      preparationTime: 30,
      cookingTime: 20,
      difficulty: 'Intermédiaire',
      servings: 8,
      category: 'Desserts',
      tags: ['Tarte', 'Citron', 'Meringue'],
      ingredients: {
        create: [
          { name: 'Pâte sablée', quantity: 1, unit: 'unité' },
          { name: 'Citrons', quantity: 4, unit: 'unités' },
          { name: 'Oeufs', quantity: 4, unit: 'unités' },
          { name: 'Sucre', quantity: 150, unit: 'grammes' },
          { name: 'Beurre', quantity: 75, unit: 'grammes' },
        ],
      },
      steps: {
        create: [
          { order: 1, description: 'Préchauffez le four à 180°C.', duration: 5 },
          { order: 2, description: 'Étalez la pâte dans un moule à tarte et piquez-la avec une fourchette. Faites-la cuire à blanc pendant 10 minutes.', duration: 15 },
          { order: 3, description: 'Pendant ce temps, préparez la crème au citron : dans un saladier, mélangez les jaunes d\'oeufs avec le sucre et le zeste des citrons.', duration: 5 },
          { order: 4, description: 'Ajoutez le jus des citrons et mélangez bien. Incorporez le beurre fondu et mélangez jusqu\'à obtenir une crème lisse.', duration: 5 },
          { order: 5, description: 'Versez la crème sur le fond de tarte précuit et remettez au four pour 10 minutes.', duration: 10 },
          { order: 6, description: 'Préparez la meringue : montez les blancs en neige ferme avec une pincée de sel. Ajoutez progressivement le sucre tout en continuant de battre.', duration: 10 },
          { order: 7, description: 'Recouvrez la tarte de meringue et remettez au four pour 5 à 10 minutes, jusqu\'à ce que la meringue soit légèrement dorée.', duration: 10 },
          { order: 8, description: 'Laissez refroidir complètement avant de déguster.', duration: 60 },
        ],
      },
      author: {
        connect: { id: user.id },
      },
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 