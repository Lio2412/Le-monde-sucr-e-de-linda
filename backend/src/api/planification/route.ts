import { NextResponse } from 'next/server';
import { planificationSchema } from '@/services/planification.service';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const contenuType = searchParams.get('contenuType');
    const statut = searchParams.get('statut');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');

    const skip = (page - 1) * limit;

    // Construction de la requête Supabase
    let query = supabase
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
      `, { count: 'exact' });

    // Ajout des filtres conditionnels
    if (contenuType) {
      query = query.eq('contenu_type', contenuType);
    }
    
    if (statut) {
      query = query.eq('statut', statut);
    }
    
    if (dateDebut) {
      query = query.gte('date_publication', new Date(dateDebut).toISOString());
    }
    
    if (dateFin) {
      query = query.lte('date_publication', new Date(dateFin).toISOString());
    }

    // Ajout de l'ordre, pagination et exécution de la requête
    const { data: planifications, error, count } = await query
      .order('date_publication', { ascending: true })
      .range(skip, skip + limit - 1);

    if (error) {
      throw new Error(`Erreur lors de la récupération des planifications: ${error.message}`);
    }

    // Conversion des données pour correspondre au format attendu
    const formattedPlanifications = planifications ? planifications.map((p: any) => ({
      ...p,
      type: p.recette ? 'recette' : 'article',
      titre: p.recette ? p.recette.titre : p.article ? p.article.titre : '',
      auteur: p.recette ? p.recette.auteur : p.article ? p.article.auteur : null,
    })) : [];

    return NextResponse.json({
      data: formattedPlanifications,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des planifications:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des planifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = planificationSchema.parse(data);

    // Vérifier si le contenu existe
    let contenu = null;
    
    if (validatedData.contenuType === 'recette') {
      const { data: recette, error } = await supabase
        .from('recettes')
        .select('id')
        .eq('id', validatedData.contenuId)
        .single();
      
      if (error) {
        throw new Error(`Erreur lors de la vérification de l'existence de la recette: ${error.message}`);
      }
      
      contenu = recette;
    } else {
      const { data: article, error } = await supabase
        .from('articles')
        .select('id')
        .eq('id', validatedData.contenuId)
        .single();
      
      if (error) {
        throw new Error(`Erreur lors de la vérification de l'existence de l'article: ${error.message}`);
      }
      
      contenu = article;
    }

    if (!contenu) {
      return NextResponse.json(
        { error: 'Le contenu spécifié n\'existe pas' },
        { status: 404 }
      );
    }

    // Adapter les clés au format de Supabase
    const planificationData = {
      contenu_type: validatedData.contenuType,
      contenu_id: validatedData.contenuId,
      date_publication: validatedData.datePublication,
      statut: validatedData.statut,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Créer la planification
    const { data: planification, error } = await supabase
      .from('planifications')
      .insert(planificationData)
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
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la planification: ${error.message}`);
    }

    if (!planification) {
      throw new Error("Aucune planification n'a été créée");
    }

    // Convertir pour maintenir la compatibilité
    const formattedPlanification = {
      ...planification,
      type: planification.recette ? 'recette' : 'article',
      titre: planification.recette ? planification.recette.titre : planification.article ? planification.article.titre : '',
      auteur: planification.recette ? planification.recette.auteur : planification.article ? planification.article.auteur : null,
    };

    return NextResponse.json(formattedPlanification);
  } catch (error: any) {
    console.error('Erreur lors de la création de la planification:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la planification' },
      { status: 500 }
    );
  }
}