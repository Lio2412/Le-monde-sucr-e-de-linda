/**
 * Données mock pour les recettes
 * À utiliser en développement ou lorsque l'API backend n'est pas disponible
 */

export const mockRecipes = [
  {
    id: '1',
    titre: 'Gâteau au chocolat fondant',
    categorie: 'Desserts',
    statut: 'publié',
    date_creation: '2023-05-15T14:30:00Z',
    vues: 1250,
    description: 'Un délicieux gâteau au chocolat fondant, facile à réaliser et parfait pour toutes les occasions.',
    temps_preparation: 15,
    temps_cuisson: 25,
    difficulte: 'facile',
    portions: 8
  },
  {
    id: '2',
    titre: 'Tarte aux fraises',
    categorie: 'Pâtisseries',
    statut: 'publié',
    date_creation: '2023-06-10T09:45:00Z',
    vues: 890,
    description: 'Une tarte aux fraises fraîche et gourmande, idéale pour le printemps et l\'été.',
    temps_preparation: 30,
    temps_cuisson: 20,
    difficulte: 'moyen',
    portions: 6
  },
  {
    id: '3',
    titre: 'Cookies aux pépites de chocolat',
    categorie: 'Biscuits',
    statut: 'publié',
    date_creation: '2023-04-20T16:15:00Z',
    vues: 1560,
    description: 'Des cookies moelleux à l\'intérieur et croustillants à l\'extérieur, avec de généreuses pépites de chocolat.',
    temps_preparation: 20,
    temps_cuisson: 12,
    difficulte: 'facile',
    portions: 24
  },
  {
    id: '4',
    titre: 'Mousse au chocolat',
    categorie: 'Desserts',
    statut: 'brouillon',
    date_creation: '2023-07-05T11:00:00Z',
    vues: 0,
    description: 'Une mousse au chocolat légère et aérienne, prête en quelques minutes.',
    temps_preparation: 15,
    temps_cuisson: 0,
    difficulte: 'facile',
    portions: 4
  },
  {
    id: '5',
    titre: 'Éclairs au café',
    categorie: 'Pâtisseries',
    statut: 'publié',
    date_creation: '2023-03-12T13:20:00Z',
    vues: 750,
    description: 'Des éclairs au café élégants et savoureux, pour impressionner vos invités.',
    temps_preparation: 45,
    temps_cuisson: 35,
    difficulte: 'difficile',
    portions: 10
  },
  {
    id: '6',
    titre: 'Macarons à la framboise',
    categorie: 'Biscuits',
    statut: 'brouillon',
    date_creation: '2023-08-01T15:30:00Z',
    vues: 0,
    description: 'Des macarons colorés et délicats, avec une ganache onctueuse à la framboise.',
    temps_preparation: 60,
    temps_cuisson: 15,
    difficulte: 'difficile',
    portions: 20
  },
  {
    id: '7',
    titre: 'Crème brûlée à la vanille',
    categorie: 'Desserts',
    statut: 'publié',
    date_creation: '2023-05-28T10:15:00Z',
    vues: 680,
    description: 'Une crème brûlée classique avec une touche de vanille, et une croûte de caramel craquante.',
    temps_preparation: 20,
    temps_cuisson: 45,
    difficulte: 'moyen',
    portions: 6
  },
  {
    id: '8',
    titre: 'Pain au chocolat maison',
    categorie: 'Viennoiseries',
    statut: 'publié',
    date_creation: '2023-06-18T07:40:00Z',
    vues: 920,
    description: 'Des pains au chocolat faits maison, croustillants et feuilletés, avec un cœur de chocolat fondant.',
    temps_preparation: 120,
    temps_cuisson: 15,
    difficulte: 'difficile',
    portions: 12
  },
  {
    id: '9',
    titre: 'Cheesecake new-yorkais',
    categorie: 'Desserts',
    statut: 'publié',
    date_creation: '2023-07-25T16:45:00Z',
    vues: 450,
    description: 'Un cheesecake onctueux à la new-yorkaise, avec une base de biscuits croustillante.',
    temps_preparation: 30,
    temps_cuisson: 60,
    difficulte: 'moyen',
    portions: 12
  },
  {
    id: '10',
    titre: 'Madeleines au citron',
    categorie: 'Biscuits',
    statut: 'brouillon',
    date_creation: '2023-08-10T14:20:00Z',
    vues: 0,
    description: 'Des madeleines moelleuses parfumées au citron, avec leur bosse caractéristique.',
    temps_preparation: 15,
    temps_cuisson: 12,
    difficulte: 'facile',
    portions: 24
  }
];

/**
 * Simule une réponse d'API avec pagination
 * @param {Object} options - Options de pagination et filtrage
 * @returns {Object} Réponse formatée avec pagination
 */
export const getMockRecipes = (options = {}) => {
  const {
    page = 1,
    pageSize = 10,
    search = '',
    sortBy = 'date_creation',
    sortDirection = 'desc',
    categoryId = ''
  } = options;
  
  // Filtrer les recettes selon les critères
  let filteredRecipes = [...mockRecipes];
  
  // Filtre par recherche
  if (search) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.titre.toLowerCase().includes(search.toLowerCase()) ||
      recipe.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Filtre par catégorie
  if (categoryId) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.categorie.toLowerCase() === categoryId.toLowerCase()
    );
  }
  
  // Tri des recettes
  filteredRecipes.sort((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    return sortDirection === 'asc' 
      ? valueA - valueB 
      : valueB - valueA;
  });
  
  // Calcul de la pagination
  const offset = (page - 1) * pageSize;
  const paginatedRecipes = filteredRecipes.slice(offset, offset + pageSize);
  const totalItems = filteredRecipes.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Construction de la réponse
  return {
    recipes: paginatedRecipes,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      totalItems,
      totalPages
    },
    filters: {
      search,
      categoryId,
      sortBy,
      sortDirection
    }
  };
}; 