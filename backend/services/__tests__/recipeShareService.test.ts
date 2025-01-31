import { RecipeShareService } from '../recipeShareService';
import { prisma } from '../../lib/prisma';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('RecipeShareService', () => {
  const mockRecipeShare = {
    recipeId: 'test-recipe-id',
    imageUrl: 'http://example.com/image.jpg',
    comment: 'Test comment',
    userId: 'test-user-id'
  };

  beforeEach(async () => {
    // Créer une recette de test
    await prisma.recipe.create({
      data: {
        id: 'test-recipe-id',
        title: 'Test Recipe',
        slug: 'test-recipe',
        description: 'Test recipe description',
        preparationTime: 30,
        cookingTime: 45,
        difficulty: 'MEDIUM',
        servings: 4,
        category: 'DESSERT',
        authorId: 'test-user-id'
      }
    });

    // Créer un utilisateur de test
    await prisma.user.create({
      data: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }
    });
  });

  afterEach(async () => {
    // Nettoyer la base de données après chaque test
    await prisma.recipeShare.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.user.deleteMany();
  });

  it('crée un nouveau partage de recette', async () => {
    const share = await RecipeShareService.create(mockRecipeShare);
    
    expect(share).toBeDefined();
    expect(share.recipeId).toBe(mockRecipeShare.recipeId);
    expect(share.imageUrl).toBe(mockRecipeShare.imageUrl);
    expect(share.comment).toBe(mockRecipeShare.comment);
    expect(share.userId).toBe(mockRecipeShare.userId);
  });

  it('récupère les partages par ID de recette', async () => {
    await RecipeShareService.create(mockRecipeShare);
    
    const shares = await RecipeShareService.getByRecipeId(mockRecipeShare.recipeId);
    
    expect(shares).toHaveLength(1);
    expect(shares[0].recipeId).toBe(mockRecipeShare.recipeId);
  });

  it('récupère les derniers partages', async () => {
    await RecipeShareService.create(mockRecipeShare);
    
    const shares = await RecipeShareService.getLatest(1);
    
    expect(shares).toHaveLength(1);
    expect(shares[0].recipeId).toBe(mockRecipeShare.recipeId);
  });

  it('supprime un partage', async () => {
    const share = await RecipeShareService.create(mockRecipeShare);
    
    await RecipeShareService.delete(share.id);
    
    const deletedShare = await prisma.recipeShare.findUnique({
      where: { id: share.id }
    });
    
    expect(deletedShare).toBeNull();
  });
}); 