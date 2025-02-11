import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface Commentaire {
  id: string;
  _count: {
    reponses: number;
  };
}

const actionMasseSchema = z.object({
  ids: z.array(z.string()),
  action: z.enum(['approuver', 'rejeter', 'supprimer']),
  motif: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { ids, action, motif } = actionMasseSchema.parse(data);

    // Vérifier que tous les commentaires existent
    const commentaires = await prisma.commentaire.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        _count: {
          select: {
            reponses: true,
          },
        },
      },
    });

    if (commentaires.length !== ids.length) {
      return NextResponse.json(
        { error: 'Certains commentaires n\'existent pas' },
        { status: 400 }
      );
    }

    // Effectuer l'action en fonction du type
    switch (action) {
      case 'approuver':
        await prisma.commentaire.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            statut: 'approuve',
            updatedAt: new Date(),
          },
        });
        break;

      case 'rejeter':
        if (!motif) {
          return NextResponse.json(
            { error: 'Le motif est requis pour rejeter des commentaires' },
            { status: 400 }
          );
        }
        await prisma.commentaire.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            statut: 'rejete',
            motifRejet: motif,
            updatedAt: new Date(),
          },
        });
        break;

      case 'supprimer':
        // Pour chaque commentaire
        await Promise.all(
          commentaires.map(async (commentaire: Commentaire) => {
            if (commentaire._count.reponses > 0) {
              // Si le commentaire a des réponses, on le marque comme supprimé
              await prisma.commentaire.update({
                where: { id: commentaire.id },
                data: {
                  contenu: '[Commentaire supprimé]',
                  auteurNom: '[Supprimé]',
                  auteurEmail: '',
                  statut: 'rejete',
                },
              });
            } else {
              // Sinon, on le supprime complètement
              await prisma.commentaire.delete({
                where: { id: commentaire.id },
              });
            }
          })
        );
        break;
    }

    // Récupérer les commentaires mis à jour (sauf ceux supprimés)
    const commentairesMisAJour = await prisma.commentaire.findMany({
      where: {
        id: {
          in: ids,
        },
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

    // TODO: Envoyer les notifications appropriées

    return NextResponse.json({
      success: true,
      commentaires: commentairesMisAJour,
    });
  } catch (error) {
    console.error('Erreur lors de l\'action de masse sur les commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'action de masse sur les commentaires' },
      { status: 500 }
    );
  }
} 