import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');

    // Récupérer tous les tags
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*');

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    // Pour chaque tag, compter les articles et les recettes
    const tagsAvecComptage = await Promise.all(
      (tags || []).map(async (tag) => {
        // Compter les articles liés au tag
        const { count: articlesCount, error: articlesError } = await supabase
          .from('article_tags')
          .select('article_id', { count: 'exact', head: true })
          .eq('tag_id', tag.id);

        if (articlesError) {
          console.error(`Erreur lors du comptage des articles pour le tag ${tag.id}:`, articlesError);
        }

        // Compter les recettes liées au tag
        const { count: recettesCount, error: recettesError } = await supabase
          .from('recipe_tags')
          .select('recipe_id', { count: 'exact', head: true })
          .eq('tag_id', tag.id);

        if (recettesError) {
          console.error(`Erreur lors du comptage des recettes pour le tag ${tag.id}:`, recettesError);
        }

        // Ajouter les compteurs et calculer le score
        const articleCount = articlesCount || 0;
        const recetteCount = recettesCount || 0;

        let score = 0;
        // Calculer le score en fonction du type demandé
        if (type === 'article') {
          score = articleCount;
        } else if (type === 'recette') {
          score = recetteCount;
        } else {
          score = articleCount + recetteCount;
        }

        return {
          ...tag,
          _count: {
            articles: articleCount,
            recettes: recetteCount
          },
          score
        };
      })
    );

    // Filtrer les tags en fonction du type si nécessaire
    let tagsFiltrés = tagsAvecComptage;
    
    if (type === 'article') {
      tagsFiltrés = tagsFiltrés.filter(tag => tag._count.articles > 0);
    } else if (type === 'recette') {
      tagsFiltrés = tagsFiltrés.filter(tag => tag._count.recettes > 0);
    }

    // Trier par score et limiter le nombre de résultats
    tagsFiltrés.sort((a, b) => b.score - a.score);
    const tagsLimités = tagsFiltrés.slice(0, limit);

    return NextResponse.json(tagsLimités);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags populaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tags populaires', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}