import { describe, it, expect, vi, beforeEach } from 'vitest';
import { metadataService } from '@/services/metadata.service';

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MetadataService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getMetadata', () => {
    it('devrait récupérer les métadonnées avec succès', async () => {
      const mockMetadata = {
        title: 'Test Title',
        description: 'Test Description',
        keywords: 'test, keywords',
        ogImage: '/test-image.jpg',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMetadata),
      });

      const result = await metadataService.getMetadata('/test-path');
      expect(result).toEqual(mockMetadata);
      expect(mockFetch).toHaveBeenCalledWith('/api/metadata/test-path');
    });

    it('devrait gérer les erreurs de récupération', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(metadataService.getMetadata('/test-path')).rejects.toThrow(
        'Erreur lors de la récupération des métadonnées'
      );
    });
  });

  describe('updateMetadata', () => {
    const mockMetadata = {
      title: 'Test Title',
      description: 'Test Description',
      keywords: 'test, keywords',
      ogImage: '/test-image.jpg',
    };

    it('devrait mettre à jour les métadonnées avec succès', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMetadata),
      });

      const result = await metadataService.updateMetadata('/test-path', mockMetadata);
      expect(result).toEqual(mockMetadata);
      expect(mockFetch).toHaveBeenCalledWith('/api/metadata/test-path', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockMetadata),
      });
    });

    it('devrait gérer les erreurs de mise à jour', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(metadataService.updateMetadata('/test-path', mockMetadata)).rejects.toThrow(
        'Erreur lors de la mise à jour des métadonnées'
      );
    });
  });

  describe('generateSitemap', () => {
    it('devrait générer le sitemap avec succès', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await metadataService.generateSitemap();
      expect(mockFetch).toHaveBeenCalledWith('/api/metadata/sitemap/generate', {
        method: 'POST',
      });
    });

    it('devrait gérer les erreurs de génération du sitemap', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(metadataService.generateSitemap()).rejects.toThrow(
        'Erreur lors de la génération du sitemap'
      );
    });
  });

  describe('generateSchemaOrg', () => {
    const mockRecipeData = {
      title: 'Test Recipe',
      description: 'Test Description',
      publishedAt: '2024-02-02',
      image: '/test-image.jpg',
      category: 'Desserts',
      prepTime: 'PT20M',
      cookTime: 'PT30M',
      totalTime: 'PT50M',
      servings: '8',
      ingredients: ['Ingredient 1', 'Ingredient 2'],
      instructions: ['Step 1', 'Step 2'],
    };

    it('devrait générer un schéma Recipe valide', () => {
      const schema = JSON.parse(metadataService.generateRecipeSchema(mockRecipeData));
      expect(schema['@type']).toBe('Recipe');
      expect(schema.name).toBe('Test Recipe');
      expect(schema.recipeInstructions).toHaveLength(2);
      expect(schema.recipeInstructions[0]['@type']).toBe('HowToStep');
    });

    const mockBlogPostData = {
      title: 'Test Blog Post',
      description: 'Test Description',
      publishedAt: '2024-02-02',
      updatedAt: '2024-02-02',
      image: '/test-image.jpg',
      slug: 'test-post',
    };

    it('devrait générer un schéma BlogPosting valide', () => {
      const schema = JSON.parse(metadataService.generateBlogPostSchema(mockBlogPostData));
      expect(schema['@type']).toBe('BlogPosting');
      expect(schema.headline).toBe('Test Blog Post');
      expect(schema.author['@type']).toBe('Person');
      expect(schema.publisher['@type']).toBe('Organization');
    });
  });
}); 