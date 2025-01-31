// Mock des variables d'environnement
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Mock de Prisma
const mockUser = {
  id: 'test-user-id',
  email: 'test@test.com',
  password: 'hashedPassword123',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date()
};

const createMockRecipe = (data = {}) => ({
  id: 'test-recipe-id',
  title: 'Test Recipe',
  description: 'Test Description',
  slug: 'test-recipe',
  preparationTime: 15,
  cookingTime: 30,
  difficulty: 'MEDIUM',
  servings: 4,
  category: 'DESSERT',
  tags: ['test'],
  author: mockUser,
  authorId: mockUser.id,
  ingredients: [],
  steps: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...data
});

const mockPrismaClient = {
  user: {
    create: jest.fn().mockResolvedValue(mockUser),
    findUnique: jest.fn().mockResolvedValue(mockUser),
    findFirst: jest.fn().mockResolvedValue(mockUser),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  },
  recipe: {
    create: jest.fn().mockImplementation((args) => {
      const recipe = createMockRecipe({
        ...args.data,
        id: Math.random().toString(36).substring(7),
        ingredients: args.data.ingredients?.create || [],
        steps: args.data.steps?.create || []
      });
      mockPrismaClient.recipe.findMany.mockImplementation(() => Promise.resolve([recipe]));
      mockPrismaClient.recipe.findUnique.mockImplementation(({ where }) => 
        where.id === recipe.id ? Promise.resolve(recipe) : Promise.resolve(null)
      );
      return Promise.resolve(recipe);
    }),
    findMany: jest.fn().mockImplementation(() => Promise.resolve([])),
    findUnique: jest.fn().mockImplementation(({ where }) => {
      if (where.id === '999999') {
        return Promise.resolve(null);
      }
      return Promise.resolve(createMockRecipe());
    }),
    update: jest.fn().mockImplementation((args) => {
      const updatedRecipe = createMockRecipe({
        ...args.data,
        id: args.where.id,
        ingredients: args.data.ingredients?.create || [],
        steps: args.data.steps?.create || []
      });
      mockPrismaClient.recipe.findUnique.mockImplementation(({ where }) => 
        where.id === updatedRecipe.id ? Promise.resolve(updatedRecipe) : Promise.resolve(null)
      );
      return Promise.resolve(updatedRecipe);
    }),
    delete: jest.fn().mockImplementation((args) => {
      const deletedRecipe = createMockRecipe({ id: args.where.id });
      mockPrismaClient.recipe.findUnique.mockImplementation(({ where }) => 
        where.id === deletedRecipe.id ? Promise.resolve(null) : Promise.resolve(createMockRecipe())
      );
      return Promise.resolve(deletedRecipe);
    }),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    count: jest.fn().mockResolvedValue(1),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
  Object.values(mockPrismaClient).forEach(model => {
    Object.values(model).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockClear();
      }
    });
  });
}); 