import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const dossierSchema = z.object({
  nom: z.string().min(1, 'Le nom du dossier est requis'),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const dossiers = await prisma.dossierMedia.findMany({
      include: {
        _count: {
          select: {
            medias: true,
          },
        },
      },
      orderBy: {
        nom: 'asc',
      },
    });

    return NextResponse.json(dossiers);
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dossiers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = dossierSchema.parse(data);

    // Vérifier si le dossier existe déjà
    const existingDossier = await prisma.dossierMedia.findUnique({
      where: {
        nom: validatedData.nom,
      },
    });

    if (existingDossier) {
      return NextResponse.json(
        { error: 'Un dossier avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Créer le dossier
    const dossier = await prisma.dossierMedia.create({
      data: validatedData,
    });

    return NextResponse.json(dossier);
  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du dossier' },
      { status: 500 }
    );
  }
} 