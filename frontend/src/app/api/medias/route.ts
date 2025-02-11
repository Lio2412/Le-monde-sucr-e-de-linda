import { NextResponse } from 'next/server';
import { mediaSchema } from '@/services/medias.service';
import { prisma } from '@/lib/prisma';
import { getImageMetadata } from '@/lib/image';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const dossier = searchParams.get('dossier');

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { nom: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        type ? { type } : {},
        dossier ? { dossier } : {},
      ],
    };

    const [medias, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      medias,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des médias:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des médias' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = mediaSchema.parse(data);

    // Créer le média
    const media = await prisma.media.create({
      data: validatedData,
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Erreur lors de la création du média:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du média' },
      { status: 500 }
    );
  }
} 