export const getRecipeBySlug = async (slug: string) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { 
        slug: slug.toLowerCase().trim() // Normalisation du slug
      },
      include: { ingredients: true, steps: true }
    });
    
    console.log('Résultat DB:', recipe ? 'Trouvé' : 'Non trouvé');
    return recipe;
  } catch (error) {
    console.error('Erreur DB:', error);
    throw error;
  }
}; 