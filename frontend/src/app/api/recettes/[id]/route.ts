import { NextResponse } from 'next/server';
import { recetteSchema } from '@/services/recettes.service';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const recette = await prisma.recette.findUnique({
      where: { id: params.id },
    });

    if (!recette) {
      return NextResponse.json(
        { error: 'Recette non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(recette);
  } catch (error) {
    console.error('Erreur lors de la récupération de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la recette' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = recetteSchema.partial().parse(data);

    const recette = await prisma.recette.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(recette);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la recette' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await prisma.recette.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la recette' },
      { status: 500 }
    );
  }
} 