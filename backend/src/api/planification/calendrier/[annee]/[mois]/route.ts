import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { annee: string; mois: string } }
) {
  try {
    const annee = parseInt(params.annee);
    const mois = parseInt(params.mois);

    // Créer les dates de début et de fin du mois
    const dateDebut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);

    // Récupération des planifications avec Supabase
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
      .gte('date_publication', dateDebut.toISOString())
      .lte('date_publication', dateFin.toISOString())
      .order('date_publication', { ascending: true });

    if (error) {
      throw new Error(`Erreur lors de la récupération des planifications: ${error.message}`);
    }

    // Conversion des données pour correspondre au format attendu
    const formattedPlanifications = planifications.map(p => ({
      ...p,
      type: p.recette ? 'recette' : 'article',
      titre: p.recette ? p.recette.titre : p.article ? p.article.titre : '',
      auteur: p.recette ? p.recette.auteur : p.article ? p.article.auteur : null,
    }));

    // Organiser les planifications par jour
    const calendrier = Array.from({ length: dateFin.getDate() }, (_, i) => {
      const jour = i + 1;
      const planificationsJour = formattedPlanifications.filter(p => 
        new Date(p.date_publication).getDate() === jour
      );
      
      return {
        jour,
        planifications: planificationsJour,
      };
    });

    return NextResponse.json({
      annee,
      mois,
      nombreJours: dateFin.getDate(),
      premierJour: dateDebut.getDay(),
      calendrier,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du calendrier:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du calendrier' },
      { status: 500 }
    );
  }
} 