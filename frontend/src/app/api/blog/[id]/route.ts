import { NextResponse } from 'next/server';
import { articleSchema } from '@/services/blog.service';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = articleSchema.partial().parse(data);

    // Mettre à jour le slug si le titre est modifié
    if (validatedData.titre) {
      validatedData.slug = slugify(validatedData.titre, {
        lower: true,
        strict: true,
        locale: 'fr',
      });
    }

    const article = await prisma.article.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'article' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await prisma.article.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    );
  }
} 