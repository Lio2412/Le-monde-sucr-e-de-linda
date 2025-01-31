import { Recette } from '@/types/recette';
import { Recipe, Ingredient, Step, Comment } from '@/types/recipe';

export const convertToRecipe = (recette: Recette): Recipe => {
  // Convertir les ingrédients en objets Ingredient
  const ingredients: Ingredient[] = recette.ingredients.map(ing => {
    // Extraire la quantité et l'unité du texte de l'ingrédient
    const match = ing.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/);
    if (match) {
      const [_, quantity, unit, name] = match;
      return {
        name: name.trim(),
        quantity: quantity,
        unit: unit || ''
      };
    }
    // Si le format ne correspond pas, retourner l'ingrédient sans quantité ni unité
    return {
      name: ing,
      quantity: '1',
      unit: 'pièce'
    };
  });

  // Convertir les instructions en objets Step
  const steps: Step[] = recette.instructions.map(instruction => ({
    description: instruction,
    duration: '0'
  }));

  // Créer un commentaire avec les notes
  const comment: Comment = {
    id: 'system-rating',
    content: `Note moyenne: ${recette.notes.moyenne}/5 (${recette.notes.total} avis)`,
    createdAt: recette.dateCreation,
    user: {
      id: recette.auteur.id,
      name: recette.auteur.nom,
      avatar: recette.auteur.avatar
    }
  };

  return {
    id: recette.id,
    slug: recette.slug,
    title: recette.titre,
    description: recette.description,
    mainImage: recette.imageUrl || '/images/default-recipe.jpg',
    preparationTime: recette.tempsPreparation,
    cookingTime: recette.tempsCuisson,
    difficulty: recette.difficulte,
    servings: recette.portions,
    category: recette.categorie[0] || 'Non catégorisé',
    tags: recette.categorie,
    ingredients,
    equipment: [
      'Four',
      'Batteur électrique',
      'Moule à tarte',
      'Balance de cuisine',
      'Saladier',
      'Fouet',
      'Spatule',
      'Papier cuisson'
    ],
    steps,
    comments: [comment]
  };
}; 