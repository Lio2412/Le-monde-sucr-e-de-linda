import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const comment = formData.get('comment') as string;
    const recipeId = formData.get('recipeId') as string;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'ID de recette manquant' },
        { status: 400 }
      );
    }

    let imageUrl = null;
    if (image) {
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

      try {
        // Lecture du buffer de l'image
        const buffer = Buffer.from(await image.arrayBuffer());

        // Optimisation de l'image avec sharp
        const optimizedBuffer = await sharp(buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        // Création du nom de fichier unique
        const fileName = `${recipeId}-${Date.now()}.jpg`;
        const publicPath = join(process.cwd(), 'public', 'uploads', 'shares');
        const filePath = join(publicPath, fileName);

        // Sauvegarde de l'image optimisée
        await writeFile(filePath, optimizedBuffer);
        imageUrl = `/uploads/shares/${fileName}`;
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        return NextResponse.json(
          { error: 'Erreur lors du traitement de l\'image' },
          { status: 500 }
        );
      }
    }

    // Enregistrement dans la base de données
    // TODO: Implémenter la sauvegarde dans la base de données
    const share = {
      recipeId,
      imageUrl,
      comment,
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

// Configuration pour augmenter la limite de taille des fichiers
export const config = {
  api: {
    bodyParser: false,
  },
}; 