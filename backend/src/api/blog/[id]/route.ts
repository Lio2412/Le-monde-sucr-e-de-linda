import { NextResponse } from 'next/server';
import { articleSchema } from '@/services/blog.service';
import { supabase } from '@/lib/supabase';
import slugify from 'slugify';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Récupération de l'article avec Supabase
    const { data: article, error } = await supabase
      .from('articles')
      .select('*, auteur:users!auteur_id(id, nom, prenom)')
      .eq('id', params.id)
      .single();

    if (error) {
      throw new Error(`Erreur lors de la récupération de l'article: ${error.message}`);
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error: any) {
    console.error('Erreur GET /api/blog/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const validatedData = articleSchema.parse(body);

    // Vérifier si l'article existe
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingArticle) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Générer le slug si le titre a changé
    let slug = validatedData.slug;
    if (!slug || (validatedData.titre && slug !== slugify(validatedData.titre, { lower: true, strict: true }))) {
      slug = slugify(validatedData.titre, { lower: true, strict: true });
      
      // Vérifier que le slug n'existe pas déjà pour un autre article
      const { data: existingSlug } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .neq('id', params.id)
        .single();

      if (existingSlug) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }
    }

    // Mise à jour de l'article
    const { data: article, error } = await supabase
      .from('articles')
      .update({
        ...validatedData,
        slug,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*, auteur:users!auteur_id(id, nom, prenom)')
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de l'article: ${error.message}`);
    }

    return NextResponse.json(article);
  } catch (error: any) {
    console.error('Erreur PUT /api/blog/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Suppression de l'article
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de l'article: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur DELETE /api/blog/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}