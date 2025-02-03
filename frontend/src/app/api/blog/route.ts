import { NextResponse } from 'next/server';
import { articleSchema } from '@/services/blog.service';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const statut = searchParams.get('statut');
    const categorie = searchParams.get('categorie');

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { titre: { contains: search, mode: 'insensitive' } },
            { extrait: { contains: search, mode: 'insensitive' } },
            { contenu: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        statut ? { statut } : {},
        categorie ? { categorie } : {},
      ],
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          auteur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = articleSchema.parse(data);

    // Générer le slug à partir du titre
    const slug = slugify(validatedData.titre, {
      lower: true,
      strict: true,
      locale: 'fr',
    });

    // Créer l'article
    const article = await prisma.article.create({
      data: {
        ...validatedData,
        slug,
      },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    );
  }
} 