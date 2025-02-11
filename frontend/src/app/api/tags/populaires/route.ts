import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');

    const where = type === 'article' ? {
      articles: {
        some: {},
      },
    } : type === 'recette' ? {
      recettes: {
        some: {},
      },
    } : {};

    const tags = await prisma.tag.findMany({
      where,
      take: limit,
      include: {
        _count: {
          select: {
            articles: true,
            recettes: true,
          },
        },
      },
      orderBy: type === 'article' ? {
        articles: {
          _count: 'desc',
        },
      } : type === 'recette' ? {
        recettes: {
          _count: 'desc',
        },
      } : {
        articles: {
          _count: 'desc',
        },
      },
    });

    // Calculer le score de popularité
    const tagsAvecScore = tags.map(tag => ({
      ...tag,
      score: type === 'article' ? 
        tag._count.articles :
        type === 'recette' ?
          tag._count.recettes :
          tag._count.articles + tag._count.recettes,
    }));

    // Trier par score
    tagsAvecScore.sort((a, b) => b.score - a.score);

    return NextResponse.json(tagsAvecScore);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags populaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tags populaires' },
      { status: 500 }
    );
  }
} 