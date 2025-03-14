import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // Récupération des prochaines planifications avec Supabase
    const dateActuelle = new Date().toISOString();
    const { data: planifications, error } = await supabase
      .from('planifications')
      .select(`
        *,
        recette:recettes (
          titre,
          auteur:users (
            nom,
            email
          )
        ),
        article:articles (
          titre,
          auteur:users (
            nom,
            email
          )
        )
      `)
      .eq('statut', 'planifie')
      .gte('date_publication', dateActuelle)
      .order('date_publication', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Erreur lors de la récupération des prochaines planifications: ${error.message}`);
    }

    // Conversion des données pour correspondre au format attendu
    const formattedPlanifications = planifications.map(p => ({
      ...p,
      type: p.recette ? 'recette' : 'article',
      titre: p.recette ? p.recette.titre : p.article ? p.article.titre : '',
      auteur: p.recette ? p.recette.auteur : p.article ? p.article.auteur : null,
    }));

    return NextResponse.json(formattedPlanifications);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des prochaines planifications:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des prochaines planifications' },
      { status: 500 }
    );
  }
}