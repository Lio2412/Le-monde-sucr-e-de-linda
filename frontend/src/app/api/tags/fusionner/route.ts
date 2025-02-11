import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const fusionnerSchema = z.object({
  sourceId: z.string(),
  destinationId: z.string(),
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { sourceId, destinationId } = fusionnerSchema.parse(data);

    // Vérifier que les deux tags existent
    const [sourceTag, destinationTag] = await Promise.all([
      prisma.tag.findUnique({
        where: { id: sourceId },
        include: {
          articles: {
            select: { id: true },
          },
          recettes: {
            select: { id: true },
          },
        },
      }),
      prisma.tag.findUnique({
        where: { id: destinationId },
      }),
    ]);

    if (!sourceTag || !destinationTag) {
      return NextResponse.json(
        { error: 'Un ou plusieurs tags n\'existent pas' },
        { status: 404 }
      );
    }

    // Déplacer les relations vers le tag de destination
    await prisma.$transaction([
      // Mettre à jour les articles
      ...sourceTag.articles.map(article =>
        prisma.article.update({
          where: { id: article.id },
          data: {
            tags: {
              disconnect: { id: sourceId },
              connect: { id: destinationId },
            },
          },
        })
      ),

      // Mettre à jour les recettes
      ...sourceTag.recettes.map(recette =>
        prisma.recette.update({
          where: { id: recette.id },
          data: {
            tags: {
              disconnect: { id: sourceId },
              connect: { id: destinationId },
            },
          },
        })
      ),

      // Supprimer le tag source
      prisma.tag.delete({
        where: { id: sourceId },
      }),
    ]);

    // Récupérer le tag de destination mis à jour
    const tagMisAJour = await prisma.tag.findUnique({
      where: { id: destinationId },
      include: {
        _count: {
          select: {
            articles: true,
            recettes: true,
          },
        },
      },
    });

    return NextResponse.json(tagMisAJour);
  } catch (error) {
    console.error('Erreur lors de la fusion des tags:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la fusion des tags' },
      { status: 500 }
    );
  }
} 