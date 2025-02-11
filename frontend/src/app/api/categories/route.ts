import { NextResponse } from 'next/server';
import { categorieSchema } from '@/services/categories.service';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const parentId = searchParams.get('parentId');

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { nom: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        parentId ? { parentId } : {},
      ],
    };

    const [categories, total] = await Promise.all([
      prisma.categorie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ordre: 'asc' },
        include: {
          parent: {
            select: {
              id: true,
              nom: true,
              slug: true,
            },
          },
          _count: {
            select: {
              articles: true,
            },
          },
        },
      }),
      prisma.categorie.count({ where }),
    ]);

    return NextResponse.json({
      categories,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
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
    const validatedData = categorieSchema.parse(data);

    // Vérifier si une catégorie avec le même slug existe déjà
    const existingCategorie = await prisma.categorie.findFirst({
      where: {
        slug: validatedData.slug,
      },
    });

    if (existingCategorie) {
      return NextResponse.json(
        { error: 'Une catégorie avec ce slug existe déjà' },
        { status: 400 }
      );
    }

    // Si un parentId est fourni, vérifier qu'il existe
    if (validatedData.parentId) {
      const parentExists = await prisma.categorie.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentExists) {
        return NextResponse.json(
          { error: 'La catégorie parente spécifiée n\'existe pas' },
          { status: 404 }
        );
      }
    }

    // Créer la catégorie
    const categorie = await prisma.categorie.create({
      data: validatedData,
      include: {
        parent: {
          select: {
            id: true,
            nom: true,
            slug: true,
          },
        },
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    return NextResponse.json(categorie);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
} 