import { NextRequest } from 'next/server';
import { POST } from '../route';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import sharp from 'sharp';
import { writeFile } from 'fs/promises';

// Mock des dépendances
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
}));

vi.mock('sharp', () => {
  return vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('test')),
  }));
});

describe('API de partage de réalisation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne une erreur si l\'ID de la recette est manquant', async () => {
    const formData = new FormData();
    formData.append('comment', 'Test comment');

    const request = new NextRequest('http://localhost/api/recipes/share', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('ID de recette manquant');
  });

  it('accepte un partage sans image', async () => {
    const formData = new FormData();
    formData.append('recipeId', '123');
    formData.append('comment', 'Test comment');

    const request = new NextRequest('http://localhost/api/recipes/share', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.comment).toBe('Test comment');
    expect(data.data.imageUrl).toBeNull();
  });

  it('traite correctement une image valide', async () => {
    const formData = new FormData();
    formData.append('recipeId', '123');
    formData.append('comment', 'Test comment');
    
    // Création d'une fausse image
    const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
    formData.append('image', imageBlob, 'test.jpg');

    const request = new NextRequest('http://localhost/api/recipes/share', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.imageUrl).toMatch(/^\/uploads\/shares\/.+\.jpg$/);
    expect(sharp).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
  });

  it('rejette les types de fichiers non supportés', async () => {
    const formData = new FormData();
    formData.append('recipeId', '123');
    
    // Fichier non supporté
    const invalidFile = new Blob(['test'], { type: 'application/pdf' });
    formData.append('image', invalidFile, 'test.pdf');

    const request = new NextRequest('http://localhost/api/recipes/share', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Type de fichier non supporté');
  });

  it('rejette les images trop volumineuses', async () => {
    const formData = new FormData();
    formData.append('recipeId', '123');
    
    // Image de 6MB
    const largeFile = new Blob([new ArrayBuffer(6 * 1024 * 1024)], { type: 'image/jpeg' });
    formData.append('image', largeFile, 'large.jpg');

    const request = new NextRequest('http://localhost/api/recipes/share', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Image trop volumineuse');
  });

  it('gère les erreurs lors du traitement de l\'image', async () => {
    // Simuler une erreur lors du traitement de l'image
    vi.mocked(sharp).mockImplementationOnce(() => {
      throw new Error('Erreur de traitement');
    });

    const formData = new FormData();
    formData.append('recipeId', '123');
    const imageBlob = new Blob(['test'], { type: 'image/jpeg' });
    formData.append('image', imageBlob, 'test.jpg');

    const request = new NextRequest('http://localhost/api/recipes/share', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Erreur lors du traitement de l\'image');
  });
}); 