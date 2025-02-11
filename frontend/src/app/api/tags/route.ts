import { NextResponse } from 'next/server';
import { tagSchema } from '@/services/tags.service';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { nom: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        type === 'article' ? {
          articles: {
            some: {},
          },
        } : type === 'recette' ? {
          recettes: {
            some: {},
          },
        } : {},
      ],
    };

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nom: 'asc' },
        include: {
          _count: {
            select: {
              articles: true,
              recettes: true,
            },
          },
        },
      }),
      prisma.tag.count({ where }),
    ]);

    return NextResponse.json({
      tags,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Générer le slug si non fourni
    if (!data.slug) {
      data.slug = slugify(data.nom, { lower: true });
    }

    // Valider les données
    const validatedData = tagSchema.parse(data);

    // Vérifier si un tag avec le même slug existe déjà
    const existingTag = await prisma.tag.findFirst({
      where: {
        slug: validatedData.slug,
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Un tag avec ce slug existe déjà' },
        { status: 400 }
      );
    }

    // Créer le tag
    const tag = await prisma.tag.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            articles: true,
            recettes: true,
          },
        },
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Erreur lors de la création du tag:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du tag' },
      { status: 500 }
    );
  }
} 