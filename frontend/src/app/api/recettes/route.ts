import { NextResponse } from 'next/server';
import { recetteSchema } from '@/services/recettes.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const statut = searchParams.get('statut');

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { titre: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        statut ? { statut } : {},
      ],
    };

    const [recettes, total] = await Promise.all([
      prisma.recette.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.recette.count({ where }),
    ]);

    return NextResponse.json({
      recettes,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des recettes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des recettes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = recetteSchema.parse(data);

    // Créer la recette
    const recette = await prisma.recette.create({
      data: validatedData,
    });

    return NextResponse.json(recette);
  } catch (error) {
    console.error('Erreur lors de la création de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la recette' },
      { status: 500 }
    );
  }
} 