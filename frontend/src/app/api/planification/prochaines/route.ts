import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const planifications = await prisma.planification.findMany({
      where: {
        AND: [
          { statut: 'planifie' },
          { datePublication: { gte: new Date() } },
        ],
      },
      orderBy: { datePublication: 'asc' },
      take: limit,
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

    return NextResponse.json(planifications);
  } catch (error) {
    console.error('Erreur lors de la récupération des prochaines publications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des prochaines publications' },
      { status: 500 }
    );
  }
} 