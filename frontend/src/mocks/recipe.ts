import { Recipe } from '@/types/recipe';

export const mockRecipe: Recipe = {
  id: '1',
  title: 'Gâteau au Chocolat',
  description: 'Un délicieux gâteau au chocolat moelleux',
  slug: 'gateau-au-chocolat',
  tags: ['dessert', 'chocolat', 'gâteau'],
  preparationTime: 20,
  cookingTime: 30,
  servings: 8,
  difficulty: 'facile',
  category: 'Desserts',
  ingredients: [
    {
      name: 'Chocolat noir',
      quantity: 200,
      unit: 'g'
    },
    {
      name: 'Beurre',
      quantity: 200,
      unit: 'g'
    },
    {
      name: 'Sucre',
      quantity: 200,
      unit: 'g'
    },
    {
      name: 'Farine',
      quantity: 100,
      unit: 'g'
    },
    {
      name: 'Oeufs',
      quantity: 4,
      unit: ''
    }
  ],
  steps: [
    {
      description: 'Préchauffer le four à 180°C',
      duration: 0,
      temperature: 180
    },
    {
      description: 'Faire fondre le chocolat avec le beurre',
      duration: 5
    },
    {
      description: 'Mélanger les oeufs avec le sucre',
      duration: 3
    },
    {
      description: 'Ajouter la farine et mélanger',
      duration: 2
    }
  ],
  equipment: [
    'Four',
    'Moule à gâteau',
    'Saladier',
    'Fouet',
    'Balance'
  ]
};