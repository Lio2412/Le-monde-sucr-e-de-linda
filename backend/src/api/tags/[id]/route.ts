import { NextResponse } from 'next/server';
import { tagSchema } from '@/services/tags.service';
import { supabase } from '@/lib/supabase';
import slugify from 'slugify';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer le tag avec Supabase
    const { data: tag, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Tag non trouvé' },
        { status: 404 }
      );
    }

    // Compter les articles liés à ce tag
    const { count: articlesCount, error: articlesError } = await supabase
      .from('article_tags')
      .select('article_id', { count: 'exact', head: true })
      .eq('tag_id', params.id);

    if (articlesError) {
      console.error('Erreur lors du comptage des articles:', articlesError);
    }

    // Compter les recettes liées à ce tag
    const { count: recettesCount, error: recettesError } = await supabase
      .from('recipe_tags')
      .select('recipe_id', { count: 'exact', head: true })
      .eq('tag_id', params.id);

    if (recettesError) {
      console.error('Erreur lors du comptage des recettes:', recettesError);
    }

    // Formater les données pour correspondre à l'ancien format
    const formattedTag = {
      ...tag,
      _count: {
        articles: articlesCount || 0,
        recettes: recettesCount || 0
      }
    };

    return NextResponse.json(formattedTag);
  } catch (error) {
    console.error('Erreur lors de la récupération du tag:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du tag', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Générer le slug si le nom a été modifié et qu'aucun slug n'est fourni
    if (data.nom && !data.slug) {
      data.slug = slugify(data.nom, { lower: true });
    }

    // Valider les données
    const validatedData = tagSchema.partial().parse(data);

    // Vérifier si un autre tag utilise déjà ce slug
    if (validatedData.slug) {
      const { data: existingTag, error: checkError } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', validatedData.slug)
        .neq('id', params.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Erreur lors de la vérification du tag: ${checkError.message}`);
      }

      if (existingTag) {
        return NextResponse.json(
          { error: 'Un autre tag utilise déjà ce slug' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le tag
    const { data: updatedTag, error: updateError } = await supabase
      .from('tags')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour du tag: ${updateError.message}`);
    }

    // Compter les articles liés à ce tag
    const { count: articlesCount, error: articlesError } = await supabase
      .from('article_tags')
      .select('article_id', { count: 'exact', head: true })
      .eq('tag_id', params.id);

    if (articlesError) {
      console.error('Erreur lors du comptage des articles:', articlesError);
    }

    // Compter les recettes liées à ce tag
    const { count: recettesCount, error: recettesError } = await supabase
      .from('recipe_tags')
      .select('recipe_id', { count: 'exact', head: true })
      .eq('tag_id', params.id);

    if (recettesError) {
      console.error('Erreur lors du comptage des recettes:', recettesError);
    }

    // Formater les données pour correspondre à l'ancien format
    const formattedTag = {
      ...updatedTag,
      _count: {
        articles: articlesCount || 0,
        recettes: recettesCount || 0
      }
    };

    return NextResponse.json(formattedTag);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du tag:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du tag', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Compter les articles liés à ce tag
    const { count: articlesCount, error: articlesError } = await supabase
      .from('article_tags')
      .select('article_id', { count: 'exact', head: true })
      .eq('tag_id', params.id);

    if (articlesError) {
      throw new Error(`Erreur lors du comptage des articles: ${articlesError.message}`);
    }

    // Compter les recettes liées à ce tag
    const { count: recettesCount, error: recettesError } = await supabase
      .from('recipe_tags')
      .select('recipe_id', { count: 'exact', head: true })
      .eq('tag_id', params.id);

    if (recettesError) {
      throw new Error(`Erreur lors du comptage des recettes: ${recettesError.message}`);
    }

    // Vérifier si le tag est utilisé
    if ((articlesCount || 0) > 0 || (recettesCount || 0) > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un tag qui est utilisé' },
        { status: 400 }
      );
    }

    // Supprimer le tag
    const { error: deleteError } = await supabase
      .from('tags')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      throw new Error(`Erreur lors de la suppression du tag: ${deleteError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du tag:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du tag', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}