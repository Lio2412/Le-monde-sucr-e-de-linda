import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const replanifierSchema = z.object({
  datePublication: z.string().transform((date) => new Date(date)),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { datePublication } = replanifierSchema.parse(data);

    const planification = await prisma.planification.update({
      where: { id: params.id },
      data: { 
        datePublication,
        statut: 'planifie',
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
    console.error('Erreur lors de la replanification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la replanification' },
      { status: 500 }
    );
  }
} 