import { NextResponse } from 'next/server';
import { RecipeShareService } from '../../../services/recipeShareService';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { ImageOptimizationService } from '@/services/imageOptimizationService';
import path from 'path';
import { promises as fs } from 'fs';

const imageService = new ImageOptimizationService();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await req.formData();
    const recipeId = formData.get('recipeId') as string;
    const comment = formData.get('comment') as string;
    const rating = Number(formData.get('rating'));
    const image = formData.get('image') as File | null;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La note doit être comprise entre 1 et 5' },
        { status: 400 }
      );
    }

    let imagePath = null;

    if (image) {
      try {
        const buffer = Buffer.from(await image.arrayBuffer());
        const isValid = await imageService.validateImage(buffer);
        
        if (!isValid) {
          return NextResponse.json(
            { error: 'Format d\'image non supporté' },
            { status: 400 }
          );
        }

        // Créer le dossier de destination s'il n'existe pas
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'shares');
        await fs.mkdir(uploadDir, { recursive: true });

        // Générer un nom de fichier unique
        const extension = image.name.split('.').pop() || 'jpg';
        const filename = `share-${recipeId}-${Date.now()}.${extension}`;
        const fullPath = path.join(uploadDir, filename);

        // Sauvegarder l'image
        await fs.writeFile(fullPath, buffer);
        imagePath = `/uploads/shares/${filename}`;

        console.log('Image sauvegardée:', imagePath);
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        return NextResponse.json(
          { error: 'Erreur lors du traitement de l\'image' },
          { status: 500 }
        );
      }
    }

    // Créer le partage dans la base de données
    const shareService = new RecipeShareService();
    const share = await shareService.createShare({
      recipeId,
      userId: session?.user?.id,
      comment,
      rating,
      imagePath
    });

    return NextResponse.json({ success: true, share });
  } catch (error) {
    console.error('Erreur lors du partage:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du partage' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get('recipeId');

    if (recipeId) {
      const shares = await RecipeShareService.getByRecipeId(recipeId);
      return NextResponse.json(shares);
    }

    const shares = await RecipeShareService.getLatest();
    return NextResponse.json(shares);
  } catch (error) {
    console.error('Error fetching shares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('id');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const share = await RecipeShareService.getById(shareId);

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    if (share.userId !== session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await RecipeShareService.delete(shareId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting share:', error);
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    );
  }
} 