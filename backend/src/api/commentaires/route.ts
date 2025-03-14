import { NextResponse } from 'next/server';
import { commentaireSchema } from '@/services/commentaires.service';
import { supabase, generateUUID } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const contenuType = searchParams.get('contenuType');
    const contenuId = searchParams.get('contenuId');
    const statut = searchParams.get('statut');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');

    const offset = (page - 1) * limit;

    // Construire la requête de base
    let query = supabase
      .from('commentaires')
      .select('*, reponses:reponses_parent_id_fkey(*), parent:parent_id_fkey(*)', { count: 'exact' });

    // Ajouter les filtres de recherche
    if (search) {
      query = query.or(`contenu.ilike.%${search}%,auteurNom.ilike.%${search}%,auteurEmail.ilike.%${search}%`);
    }
    
    // Filtres additionnels
    if (contenuType) query = query.eq('contenuType', contenuType);
    if (contenuId) query = query.eq('contenuId', contenuId);
    if (statut) query = query.eq('statut', statut);
    
    // Filtres de date
    if (dateDebut) query = query.gte('created_at', dateDebut);
    if (dateFin) query = query.lte('created_at', dateFin);
    
    // Ordre et pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Exécuter la requête
    const { data: commentaires, error, count } = await query;

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    // Formater les données pour correspondre à l'ancien format
    const formattedCommentaires = await Promise.all(commentaires.map(async (commentaire) => {
      // Compter le nombre de réponses pour chaque commentaire
      const { count: reponsesCount, error: countError } = await supabase
        .from('commentaires')
        .select('id', { count: 'exact', head: true })
        .eq('parent_id', commentaire.id);

      if (countError) {
        console.error('Erreur lors du comptage des réponses:', countError);
      }

      return {
        ...commentaire,
        _count: {
          reponses: reponsesCount || 0
        }
      };
    }));

    return NextResponse.json({
      commentaires: formattedCommentaires,
      pagination: {
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = commentaireSchema.parse({
      ...data,
      metadata: {
        ...data.metadata,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        signalements: 0,
        motifsSignalement: [],
      },
    });

    // Vérifier si le contenu existe
    let contenuExists = false;
    
    if (validatedData.contenuType === 'recette') {
      const { data: recette, error } = await supabase
        .from('recipes')
        .select('id')
        .eq('id', validatedData.contenuId)
        .single();
      
      contenuExists = !!recette;
    } else {
      const { data: article, error } = await supabase
        .from('articles')
        .select('id')
        .eq('id', validatedData.contenuId)
        .single();
      
      contenuExists = !!article;
    }

    if (!contenuExists) {
      return NextResponse.json(
        { error: 'Le contenu spécifié n\'existe pas' },
        { status: 404 }
      );
    }

    // Si c'est une réponse, vérifier que le commentaire parent existe
    if (validatedData.parentId) {
      const { data: parentCommentaire, error } = await supabase
        .from('commentaires')
        .select('id')
        .eq('id', validatedData.parentId)
        .single();

      if (error || !parentCommentaire) {
        return NextResponse.json(
          { error: 'Le commentaire parent n\'existe pas' },
          { status: 404 }
        );
      }
    }

    // Préparer les données pour la création du commentaire
    const commentaireData = {
      id: generateUUID(),
      ...validatedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Créer le commentaire
    const { data: commentaire, error: insertError } = await supabase
      .from('commentaires')
      .insert(commentaireData)
      .select()
      .single();

    if (insertError) {
      throw new Error(`Erreur lors de la création du commentaire: ${insertError.message}`);
    }

    // Récupérer le commentaire créé avec ses relations
    const { data: fullCommentaire, error: getError } = await supabase
      .from('commentaires')
      .select('*, reponses:reponses_parent_id_fkey(*), parent:parent_id_fkey(*)')
      .eq('id', commentaire.id)
      .single();

    if (getError) {
      throw new Error(`Erreur lors de la récupération du commentaire créé: ${getError.message}`);
    }

    // Compter le nombre de réponses
    const { count: reponsesCount, error: countError } = await supabase
      .from('commentaires')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', commentaire.id);

    if (countError) {
      console.error('Erreur lors du comptage des réponses:', countError);
    }

    // Formater le résultat
    const formattedCommentaire = {
      ...fullCommentaire,
      _count: {
        reponses: reponsesCount || 0
      }
    };

    return NextResponse.json(formattedCommentaire);
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    );
  }
}