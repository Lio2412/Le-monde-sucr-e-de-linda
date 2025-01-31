export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;

export const FILE = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'] as const,
  UPLOAD_DIRS: {
    RECIPES: 'uploads/recipes',
    STEPS: 'uploads/steps'
  } as const
} as const;

export const CACHE = {
  TTL: {
    RECIPE: 60 * 60, // 1 heure
    RECIPE_LIST: 30 * 60 // 30 minutes
  } as const,
  KEYS: {
    RECIPE: (slug: string) => `recipe:${slug}`,
    RECIPE_LIST: (page: number, limit: number) => `recipes:${page}:${limit}`,
    RECIPE_SEARCH: (query: string, page: number, limit: number) => 
      `recipes:search:${query}:${page}:${limit}`,
    RECIPE_FILTER: (filters: Record<string, string>, page: number, limit: number) => 
      `recipes:filter:${JSON.stringify(filters)}:${page}:${limit}`
  } as const
} as const;

export const VALIDATION = {
  RECIPE: {
    TITLE: {
      MIN: 3,
      MAX: 100
    },
    DESCRIPTION: {
      MIN: 10
    },
    PREPARATION_TIME: {
      MIN: 1,
      MAX: 1440 // 24 heures
    },
    COOKING_TIME: {
      MIN: 0,
      MAX: 1440 // 24 heures
    },
    SERVINGS: {
      MIN: 1,
      MAX: 100
    }
  } as const
} as const; 