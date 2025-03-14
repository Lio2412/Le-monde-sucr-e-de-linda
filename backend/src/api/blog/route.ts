import { NextResponse } from 'next/server';
import { articleSchema } from '@/services/blog.service';
import { supabase } from '@/lib/supabase';
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

    // Construction de la requête Supabase
    let query = supabase
      .from('articles')
      .select('*, auteur:users!auteur_id(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    // Ajout des filtres si nécessaires
    if (search) {
      query = query.or(`titre.ilike.%${search}%,extrait.ilike.%${search}%,contenu.ilike.%${search}%`);
    }
    
    if (statut) {
      query = query.eq('statut', statut);
    }
    
    if (categorie) {
      query = query.eq('categorie', categorie);
    }

    // Exécution de la requête
    const { data: articles, count, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des articles: ${error.message}`);
    }

    return NextResponse.json({
      data: articles,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Erreur GET /api/blog:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = articleSchema.parse(body);

    // Génération du slug depuis le titre
    let slug = slugify(validatedData.titre, { lower: true, strict: true });
    
    // Vérification que le slug n'existe pas déjà
    const { data: existingSlug } = await supabase
      .from('articles')
      .select('slug')
      .eq('slug', slug)
      .single();

    // Si le slug existe déjà, ajouter un suffixe aléatoire
    if (existingSlug) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    // Création de l'article dans Supabase
    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        ...validatedData,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de l'article: ${error.message}`);
    }

    return NextResponse.json(article);
  } catch (error: any) {
    console.error('Erreur POST /api/blog:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}