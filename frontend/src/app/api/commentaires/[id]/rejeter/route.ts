import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const rejeterSchema = z.object({
  motif: z.string().min(1, 'Le motif est requis'),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { motif } = rejeterSchema.parse(data);

    const commentaire = await prisma.commentaire.update({
      where: { id: params.id },
      data: { 
        statut: 'rejete',
        motifRejet: motif,
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

    // TODO: Envoyer une notification à l'auteur avec le motif du rejet

    return NextResponse.json(commentaire);
  } catch (error) {
    console.error('Erreur lors du rejet du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors du rejet du commentaire' },
      { status: 500 }
    );
  }
} 