import { Recipe } from '@/types/recipe';

export const mockRecipe: Recipe = {
  id: '1',
  title: 'Gâteau au Chocolat',
  description: 'Un délicieux gâteau au chocolat',
  preparationTime: 20,
  cookingTime: 30,
  servings: 8,
  difficulty: 'facile',
  category: 'Desserts',
  slug: 'gateau-au-chocolat',
  tags: ['dessert', 'chocolat', 'gâteau'],
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
    }
  ],
  equipment: [
    'Saladier',
    'Fouet'
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: '1'
}; 