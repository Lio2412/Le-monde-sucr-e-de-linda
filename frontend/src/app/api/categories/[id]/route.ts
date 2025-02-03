import { NextResponse } from 'next/server';
import { categorieSchema } from '@/services/categories.service';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categorie = await prisma.categorie.findUnique({
      where: { id: params.id },
      include: {
        parent: {
          select: {
            id: true,
            nom: true,
            slug: true,
          },
        },
        enfants: {
          select: {
            id: true,
            nom: true,
            slug: true,
            ordre: true,
          },
          orderBy: {
            ordre: 'asc',
          },
        },
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    if (!categorie) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(categorie);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la catégorie' },
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
    const validatedData = categorieSchema.partial().parse(data);

    // Vérifier si une autre catégorie utilise déjà ce slug
    if (validatedData.slug) {
      const existingCategorie = await prisma.categorie.findFirst({
        where: {
          slug: validatedData.slug,
          NOT: {
            id: params.id,
          },
        },
      });

      if (existingCategorie) {
        return NextResponse.json(
          { error: 'Une autre catégorie utilise déjà ce slug' },
          { status: 400 }
        );
      }
    }

    // Si un parentId est fourni, vérifier qu'il existe et qu'il ne crée pas de cycle
    if (validatedData.parentId) {
      const parentExists = await prisma.categorie.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentExists) {
        return NextResponse.json(
          { error: 'La catégorie parente spécifiée n\'existe pas' },
          { status: 404 }
        );
      }

      // Vérifier que le nouveau parent n'est pas un descendant de la catégorie
      if (await isDescendant(validatedData.parentId, params.id)) {
        return NextResponse.json(
          { error: 'La catégorie parente ne peut pas être un descendant' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la catégorie
    const categorie = await prisma.categorie.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        parent: {
          select: {
            id: true,
            nom: true,
            slug: true,
          },
        },
        enfants: {
          select: {
            id: true,
            nom: true,
            slug: true,
            ordre: true,
          },
          orderBy: {
            ordre: 'asc',
          },
        },
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    return NextResponse.json(categorie);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier si la catégorie a des enfants
    const hasChildren = await prisma.categorie.count({
      where: { parentId: params.id },
    });

    if (hasChildren > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une catégorie qui a des sous-catégories' },
        { status: 400 }
      );
    }

    // Supprimer la catégorie
    await prisma.categorie.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour vérifier si une catégorie est descendante d'une autre
async function isDescendant(potentialDescendantId: string, ancestorId: string): Promise<boolean> {
  const categorie = await prisma.categorie.findUnique({
    where: { id: potentialDescendantId },
    select: { parentId: true },
  });

  if (!categorie || !categorie.parentId) {
    return false;
  }

  if (categorie.parentId === ancestorId) {
    return true;
  }

  return isDescendant(categorie.parentId, ancestorId);
} 