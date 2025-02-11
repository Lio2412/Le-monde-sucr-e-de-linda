export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  totalTime?: string;
  servings: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category?: string;
  tags?: string[];
  imageUrl?: string;
  image?: string;
  rating?: number;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    slug: 'tarte-au-citron-meringuee',
    title: 'Tarte au Citron Meringuée',
    description: 'Une délicieuse tarte au citron recouverte d\'une meringue légère et aérienne.',
    ingredients: [
      '1 pâte sablée',
      '4 citrons',
      '150g de sucre',
      '3 œufs',
      '125g de beurre',
      '4 blancs d\'œufs',
      '200g de sucre glace'
    ],
    instructions: [
      'Préchauffer le four à 180°C',
      'Étaler la pâte sablée dans un moule à tarte',
      'Préparer la crème au citron',
      'Cuire la pâte à blanc',
      'Verser la crème au citron',
      'Préparer la meringue',
      'Recouvrir la tarte de meringue',
      'Faire dorer au four'
    ],
    prepTime: '30 minutes',
    cookTime: '45 minutes',
    totalTime: '1 heure 15 minutes',
    servings: 8,
    difficulty: 'Moyen',
    category: 'Desserts',
    tags: ['tarte', 'citron', 'meringue', 'dessert'],
    image: '/images/recipes/tarte-citron-meringuee.jpg',
    rating: 4.8,
    author: 'Linda',
    createdAt: '2024-02-11T10:00:00Z',
    updatedAt: '2024-02-11T10:00:00Z'
  }
  // Vous pouvez ajouter d'autres recettes ici
];
