import { NextResponse } from 'next/server';
import { tagSchema } from '@/services/tags.service';
import { supabase, generateUUID } from '@/lib/supabase';
import slugify from 'slugify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');

    const offset = (page - 1) * limit;

    // Construire la requête de base pour les tags
    let query = supabase
      .from('tags')
      .select('*, recipes(count), articles(count)', { count: 'exact' });

    // Ajouter les filtres de recherche si nécessaire
    if (search) {
      query = query.or(`nom.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filtrer par type si demandé
    if (type === 'article') {
      query = query.not('articles', 'is', null);
    } else if (type === 'recette') {
      query = query.not('recipes', 'is', null);
    }

    // Pagination et tri
    query = query
      .order('nom', { ascending: true })
      .range(offset, offset + limit - 1);

    // Exécuter la requête
    const { data: tags, error, count } = await query;

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    // Formater les données pour correspondre à l'ancien format
    const formattedTags = tags.map(tag => ({
      ...tag,
      _count: {
        articles: tag.articles ? tag.articles.length : 0,
        recettes: tag.recipes ? tag.recipes.length : 0
      }
    }));

    return NextResponse.json({
      tags: formattedTags,
      pagination: {
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tags' },
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
    const validatedData = tagSchema.parse(data);

    // Vérifier si un tag avec le même slug existe déjà
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', validatedData.slug)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Erreur lors de la vérification du tag: ${checkError.message}`);
    }

    if (existingTag) {
      return NextResponse.json(
        { error: 'Un tag avec ce slug existe déjà' },
        { status: 400 }
      );
    }

    // Préparer les données pour la création du tag avec un UUID généré
    const newTag = {
      id: generateUUID(),
      ...validatedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Créer le tag
    const { data: tag, error: insertError } = await supabase
      .from('tags')
      .insert(newTag)
      .select()
      .single();

    if (insertError) {
      throw new Error(`Erreur lors de la création du tag: ${insertError.message}`);
    }

    // Ajouter les compteurs pour correspondre à l'ancien format
    return NextResponse.json({
      ...tag,
      _count: {
        articles: 0,
        recettes: 0
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du tag:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du tag' },
      { status: 500 }
    );
  }
}