import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CategorieArbre {
  id: string;
  nom: string;
  slug: string;
  ordre: number;
  enfants: CategorieArbre[];
  _count: {
    articles: number;
  };
}

async function construireArbre(categories: any[]): Promise<CategorieArbre[]> {
  // Créer un map pour un accès rapide aux catégories par ID
  const categoriesMap = new Map();
  categories.forEach(cat => {
    categoriesMap.set(cat.id, {
      ...cat,
      enfants: [],
    });
  });

  // Construire l'arbre
  const racines: CategorieArbre[] = [];
  categories.forEach(cat => {
    const categorieAvecEnfants = categoriesMap.get(cat.id);
    if (cat.parentId) {
      const parent = categoriesMap.get(cat.parentId);
      if (parent) {
        parent.enfants.push(categorieAvecEnfants);
      }
    } else {
      racines.push(categorieAvecEnfants);
    }
  });

  // Trier les enfants par ordre
  const trierEnfants = (categories: CategorieArbre[]) => {
    categories.sort((a, b) => a.ordre - b.ordre);
    categories.forEach(cat => {
      if (cat.enfants.length > 0) {
        trierEnfants(cat.enfants);
      }
    });
  };

  trierEnfants(racines);
  return racines;
}

export async function GET() {
  try {
    // Récupérer toutes les catégories avec leurs relations
    const categories = await prisma.categorie.findMany({
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        ordre: 'asc',
      },
    });

    // Construire l'arborescence
    const arborescence = await construireArbre(categories);

    return NextResponse.json(arborescence);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'arborescence:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'arborescence' },
      { status: 500 }
    );
  }
} 