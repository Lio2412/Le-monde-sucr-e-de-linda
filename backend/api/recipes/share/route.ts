import { NextResponse } from 'next/server';
import { RecipeShareService } from '../../../services/recipeShareService';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await req.formData();
    const recipeId = formData.get('recipeId') as string;
    const comment = formData.get('comment') as string;
    const image = formData.get('image') as File | null;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    let imageUrl = null;
    if (image) {
      // Simuler le traitement de l'image pour les tests
      imageUrl = `/uploads/shares/${Date.now()}.jpg`;
    }

    const share = await RecipeShareService.create({
      recipeId,
      imageUrl,
      comment,
      userId: session?.user?.id,
    });

    return NextResponse.json({
      success: true,
      data: share
    });
  } catch (error) {
    console.error('Error sharing recipe:', error);
    return NextResponse.json(
      { error: 'Failed to share recipe' },
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