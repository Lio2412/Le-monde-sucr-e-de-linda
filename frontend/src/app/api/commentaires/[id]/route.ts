import { NextResponse } from 'next/server';
import { commentaireSchema } from '@/services/commentaires.service';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const commentaire = await prisma.commentaire.findUnique({
      where: { id: params.id },
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

    if (!commentaire) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(commentaire);
  } catch (error) {
    console.error('Erreur lors de la récupération du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du commentaire' },
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

    // Valider les données
    const validatedData = commentaireSchema.partial().parse(data);

    // Mettre à jour le commentaire
    const commentaire = await prisma.commentaire.update({
      where: { id: params.id },
      data: validatedData,
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

    return NextResponse.json(commentaire);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du commentaire' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier si le commentaire a des réponses
    const commentaire = await prisma.commentaire.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            reponses: true,
          },
        },
      },
    });

    if (!commentaire) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    // Si le commentaire a des réponses, on le marque comme supprimé au lieu de le supprimer
    if (commentaire._count.reponses > 0) {
      await prisma.commentaire.update({
        where: { id: params.id },
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
        where: { id: params.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du commentaire' },
      { status: 500 }
    );
  }
} 