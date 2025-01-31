import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecipe() {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: {
        slug: 'tarte-au-citron-meringuee'
      }
    });

    if (recipe) {
      console.log('Recipe found:', recipe);
    } else {
      console.log('Recipe not found');
    }
  } catch (error) {
    console.error('Error checking recipe:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecipe();
