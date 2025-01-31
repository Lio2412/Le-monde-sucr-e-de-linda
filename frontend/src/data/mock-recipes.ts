import { Recipe } from '@/types/recipe';

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    slug: 'tarte-au-citron-meringuée',
    title: 'Tarte au Citron Meringuée',
    description: 'Une délicieuse tarte au citron meringuée, parfaite pour les amateurs d\'agrumes',
    mainImage: '/images/recipes/tarte-citron-meringuee.jpg',
    preparationTime: 45,
    cookingTime: 30,
    difficulty: 'MEDIUM',
    servings: 8,
    category: 'DESSERT',
    tags: ['dessert', 'citron', 'meringue', 'tarte'],
    ingredients: [
      { name: 'Pâte sablée', quantity: '1', unit: 'pièce' },
      { name: 'Citrons', quantity: '4', unit: 'pièces' },
      { name: 'Sucre', quantity: '200', unit: 'g' },
      { name: 'Beurre', quantity: '100', unit: 'g' },
      { name: 'Oeufs', quantity: '4', unit: 'pièces' },
      { name: 'Maïzena', quantity: '20', unit: 'g' }
    ],
    equipment: [
      'Four',
      'Moule à tarte',
      'Batteur électrique',
      'Casserole',
      'Zesteur',
      'Balance'
    ],
    steps: [
      {
        description: 'Préchauffer le four à 180°C',
        duration: '5'
      },
      {
        description: 'Étaler la pâte sablée dans le moule',
        duration: '10'
      },
      {
        description: 'Préparer la crème au citron',
        duration: '20'
      },
      {
        description: 'Monter les blancs en neige',
        duration: '10'
      },
      {
        description: 'Cuire la tarte',
        duration: '30'
      }
    ],
    comments: [
      {
        id: '1',
        content: 'Excellente recette !',
        createdAt: new Date().toISOString(),
        user: {
          id: '1',
          name: 'Linda',
          avatar: '/images/avatars/linda.jpg'
        }
      }
    ]
  }
]; 