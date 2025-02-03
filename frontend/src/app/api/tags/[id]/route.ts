import { NextResponse } from 'next/server';
import { tagSchema } from '@/services/tags.service';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            articles: true,
            recettes: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Erreur lors de la récupération du tag:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du tag' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Générer le slug si le nom a été modifié et qu'aucun slug n'est fourni
    if (data.nom && !data.slug) {
      data.slug = slugify(data.nom, { lower: true });
    }

    // Valider les données
    const validatedData = tagSchema.partial().parse(data);

    // Vérifier si un autre tag utilise déjà ce slug
    if (validatedData.slug) {
      const existingTag = await prisma.tag.findFirst({
        where: {
          slug: validatedData.slug,
          NOT: {
            id: params.id,
          },
        },
      });

      if (existingTag) {
        return NextResponse.json(
          { error: 'Un autre tag utilise déjà ce slug' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le tag
    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            articles: true,
            recettes: true,
          },
        },
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du tag:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier si le tag est utilisé
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            articles: true,
            recettes: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag non trouvé' },
        { status: 404 }
      );
    }

    if (tag._count.articles > 0 || tag._count.recettes > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un tag qui est utilisé' },
        { status: 400 }
      );
    }

    // Supprimer le tag
    await prisma.tag.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du tag:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du tag' },
      { status: 500 }
    );
  }
} 