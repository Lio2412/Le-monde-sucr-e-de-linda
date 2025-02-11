import { NextResponse } from 'next/server';
import { planificationSchema } from '@/services/planification.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const contenuType = searchParams.get('contenuType');
    const statut = searchParams.get('statut');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        contenuType ? { contenuType } : {},
        statut ? { statut } : {},
        dateDebut || dateFin ? {
          datePublication: {
            ...(dateDebut && { gte: new Date(dateDebut) }),
            ...(dateFin && { lte: new Date(dateFin) }),
          },
        } : {},
      ],
    };

    const [planifications, total] = await Promise.all([
      prisma.planification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { datePublication: 'asc' },
        include: {
          recette: {
            select: {
              titre: true,
              auteur: {
                select: {
                  nom: true,
                  email: true,
                },
              },
            },
          },
          article: {
            select: {
              titre: true,
              auteur: {
                select: {
                  nom: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.planification.count({ where }),
    ]);

    return NextResponse.json({
      planifications,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des planifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des planifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = planificationSchema.parse(data);

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

    // Créer la planification
    const planification = await prisma.planification.create({
      data: validatedData,
      include: {
        recette: {
          select: {
            titre: true,
            auteur: {
              select: {
                nom: true,
                email: true,
              },
            },
          },
        },
        article: {
          select: {
            titre: true,
            auteur: {
              select: {
                nom: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(planification);
  } catch (error) {
    console.error('Erreur lors de la création de la planification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la planification' },
      { status: 500 }
    );
  }
} 