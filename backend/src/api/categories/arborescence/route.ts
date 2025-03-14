import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    if (cat.parent_id) {
      const parent = categoriesMap.get(cat.parent_id);
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
    // Récupérer toutes les catégories avec Supabase
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('ordre', { ascending: true });

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    // Pour chaque catégorie, compter le nombre d'articles associés
    const categoriesAvecComptage = await Promise.all(
      (categories || []).map(async (categorie) => {
        const { count, error: countError } = await supabase
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', categorie.id);

        if (countError) {
          console.error(`Erreur lors du comptage des articles pour la catégorie ${categorie.id}:`, countError);
        }

        return {
          ...categorie,
          _count: {
            articles: count || 0
          }
        };
      })
    );

    // Construire l'arborescence
    const arborescence = await construireArbre(categoriesAvecComptage);

    return NextResponse.json(arborescence);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'arborescence:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'arborescence', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}