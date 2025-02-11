import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const commentaire = await prisma.commentaire.update({
      where: { id: params.id },
      data: { 
        statut: 'approuve',
        updatedAt: new Date(),
      },
      include: {
        reponses: {
          select: {
            id: true,
            contenu: true,
            auteurNom: true,
            createdAt: true,
            statut: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        parent: {
          select: {
            id: true,
            contenu: true,
            auteurNom: true,
            createdAt: true,
            statut: true,
          },
        },
        _count: {
          select: {
            reponses: true,
          },
        },
      },
    });

    // TODO: Envoyer une notification à l'auteur

    return NextResponse.json(commentaire);
  } catch (error) {
    console.error('Erreur lors de l\'approbation du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'approbation du commentaire' },
      { status: 500 }
    );
  }
} 