import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const signalerSchema = z.object({
  motif: z.string().min(1, 'Le motif est requis'),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { motif } = signalerSchema.parse(data);

    // Récupérer le commentaire actuel
    const commentaireActuel = await prisma.commentaire.findUnique({
      where: { id: params.id },
      select: {
        metadata: true,
      },
    });

    if (!commentaireActuel) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour les métadonnées du commentaire
    const metadata = {
      ...commentaireActuel.metadata,
      signalements: (commentaireActuel.metadata?.signalements || 0) + 1,
      motifsSignalement: [
        ...(commentaireActuel.metadata?.motifsSignalement || []),
        motif,
      ],
    };

    // Mettre à jour le commentaire
    const commentaire = await prisma.commentaire.update({
      where: { id: params.id },
      data: { 
        statut: metadata.signalements >= 3 ? 'signale' : undefined,
        metadata,
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

    // TODO: Envoyer une notification aux modérateurs si le seuil de signalements est atteint

    return NextResponse.json(commentaire);
  } catch (error) {
    console.error('Erreur lors du signalement du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors du signalement du commentaire' },
      { status: 500 }
    );
  }
} 