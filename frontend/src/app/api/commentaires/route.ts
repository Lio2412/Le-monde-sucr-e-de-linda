import { NextResponse } from 'next/server';
import { commentaireSchema } from '@/services/commentaires.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const contenuType = searchParams.get('contenuType');
    const contenuId = searchParams.get('contenuId');
    const statut = searchParams.get('statut');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { contenu: { contains: search, mode: 'insensitive' } },
            { auteurNom: { contains: search, mode: 'insensitive' } },
            { auteurEmail: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        contenuType ? { contenuType } : {},
        contenuId ? { contenuId } : {},
        statut ? { statut } : {},
        dateDebut || dateFin ? {
          createdAt: {
            ...(dateDebut && { gte: new Date(dateDebut) }),
            ...(dateFin && { lte: new Date(dateFin) }),
          },
        } : {},
      ],
    };

    const [commentaires, total] = await Promise.all([
      prisma.commentaire.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reponses: {
            select: {
              id: true,
              contenu: true,
              auteurNom: true,
              createdAt: true,
            },
          },
          parent: {
            select: {
              id: true,
              contenu: true,
              auteurNom: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              reponses: true,
            },
          },
        },
      }),
      prisma.commentaire.count({ where }),
    ]);

    return NextResponse.json({
      commentaires,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = commentaireSchema.parse({
      ...data,
      metadata: {
        ...data.metadata,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        signalements: 0,
        motifsSignalement: [],
      },
    });

    // Vérifier si le contenu existe
    const contenu = validatedData.contenuType === 'recette'
      ? await prisma.recette.findUnique({ where: { id: validatedData.contenuId } })
      : await prisma.article.findUnique({ where: { id: validatedData.contenuId } });

    if (!contenu) {
      return NextResponse.json(
        { error: 'Le contenu spécifié n\'existe pas' },
        { status: 404 }
      );
    }

    // Si c'est une réponse, vérifier que le commentaire parent existe
    if (validatedData.parentId) {
      const parentExists = await prisma.commentaire.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentExists) {
        return NextResponse.json(
          { error: 'Le commentaire parent n\'existe pas' },
          { status: 404 }
        );
      }
    }

    // Créer le commentaire
    const commentaire = await prisma.commentaire.create({
      data: validatedData,
      include: {
        reponses: {
          select: {
            id: true,
            contenu: true,
            auteurNom: true,
            createdAt: true,
          },
        },
        parent: {
          select: {
            id: true,
            contenu: true,
            auteurNom: true,
            createdAt: true,
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
    console.error('Erreur lors de la création du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    );
  }
} 