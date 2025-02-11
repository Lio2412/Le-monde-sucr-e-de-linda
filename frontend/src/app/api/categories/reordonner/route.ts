import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reordonnerSchema = z.object({
  categories: z.array(z.object({
    id: z.string(),
    ordre: z.number(),
  })),
});

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { categories } = reordonnerSchema.parse(data);

    // Vérifier que toutes les catégories existent
    const existingCategories = await prisma.categorie.findMany({
      where: {
        id: {
          in: categories.map(c => c.id),
        },
      },
      select: {
        id: true,
      },
    });

    if (existingCategories.length !== categories.length) {
      return NextResponse.json(
        { error: 'Certaines catégories n\'existent pas' },
        { status: 400 }
      );
    }

    // Mettre à jour l'ordre des catégories
    await Promise.all(
      categories.map(({ id, ordre }) =>
        prisma.categorie.update({
          where: { id },
          data: { ordre },
        })
      )
    );

    // Récupérer les catégories mises à jour
    const updatedCategories = await prisma.categorie.findMany({
      where: {
        id: {
          in: categories.map(c => c.id),
        },
      },
      orderBy: {
        ordre: 'asc',
      },
      include: {
        parent: {
          select: {
            id: true,
            nom: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCategories);
  } catch (error) {
    console.error('Erreur lors de la réorganisation des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réorganisation des catégories' },
      { status: 500 }
    );
  }
} 