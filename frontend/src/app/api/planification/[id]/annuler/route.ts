import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const planification = await prisma.planification.update({
      where: { id: params.id },
      data: { 
        statut: 'annule',
        updatedAt: new Date(),
      },
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
    console.error('Erreur lors de l\'annulation de la planification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de la planification' },
      { status: 500 }
    );
  }
} 