import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const comment = formData.get('comment') as string;
    const recipeId = formData.get('recipeId') as string;
    const rating = Number(formData.get('rating')) || 0;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'ID de recette manquant' },
        { status: 400 }
      );
    }

    let imageUrl = null;
    if (image) {
      try {
        // Vérification du type de fichier
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(image.type)) {
          return NextResponse.json(
            { error: 'Type de fichier non supporté' },
            { status: 400 }
          );
        }

        // Vérification de la taille
        if (image.size > 5 * 1024 * 1024) { // 5MB
          return NextResponse.json(
            { error: 'Image trop volumineuse' },
            { status: 400 }
          );
        }

        // Création des dossiers si nécessaire
        const publicDir = join(process.cwd(), 'public');
        const uploadsDir = join(publicDir, 'uploads');
        const sharesDir = join(uploadsDir, 'shares');
        
        await mkdir(uploadsDir, { recursive: true });
        await mkdir(sharesDir, { recursive: true });

        // Lecture et sauvegarde de l'image
        const arrayBuffer = await image.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Création du nom de fichier unique avec l'extension originale
        const extension = image.name.split('.').pop() || 'jpg';
        const fileName = `${recipeId}-${Date.now()}.${extension}`;
        const filePath = join(sharesDir, fileName);

        // Sauvegarde de l'image
        await writeFile(filePath, uint8Array);
        imageUrl = `/uploads/shares/${fileName}`;

        console.log('Image sauvegardée avec succès:', imageUrl);
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        return NextResponse.json(
          { error: 'Erreur lors du traitement de l\'image' },
          { status: 500 }
        );
      }
    }

    // Enregistrement dans la base de données
    const share = {
      recipeId,
      imageUrl,
      comment,
      rating,
      createdAt: new Date().toISOString(),
    };

    // Pour l'instant, on simule un succès
    return NextResponse.json({
      success: true,
      data: share
    });

  } catch (error) {
    console.error('Erreur lors du partage:', error);
    return NextResponse.json(
      { error: 'Erreur lors du partage' },
      { status: 500 }
    );
  }
} 