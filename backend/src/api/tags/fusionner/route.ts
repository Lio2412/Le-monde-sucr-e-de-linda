import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const fusionnerSchema = z.object({
  sourceId: z.string(),
  destinationId: z.string(),
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { sourceId, destinationId } = fusionnerSchema.parse(data);

    // Vérifier que les deux tags existent
    const [sourceTagResult, destinationTagResult] = await Promise.all([
      supabase
        .from('tags')
        .select('id, nom')
        .eq('id', sourceId)
        .single(),
      supabase
        .from('tags')
        .select('id, nom')
        .eq('id', destinationId)
        .single(),
    ]);

    if (sourceTagResult.error || destinationTagResult.error || !sourceTagResult.data || !destinationTagResult.data) {
      console.error('Erreur lors de la récupération des tags:', sourceTagResult.error || destinationTagResult.error);
      return NextResponse.json(
        { error: 'Un ou plusieurs tags n\'existent pas' },
        { status: 404 }
      );
    }

    const sourceTag = sourceTagResult.data;
    const destinationTag = destinationTagResult.data;

    // Récupérer les relations d'articles pour le tag source
    const { data: articleTags, error: articleTagsError } = await supabase
      .from('article_tags')
      .select('article_id')
      .eq('tag_id', sourceId);

    if (articleTagsError) {
      throw new Error(`Erreur lors de la récupération des articles liés au tag source: ${articleTagsError.message}`);
    }

    // Récupérer les relations de recettes pour le tag source
    const { data: recipeTags, error: recipeTagsError } = await supabase
      .from('recipe_tags')
      .select('recipe_id')
      .eq('tag_id', sourceId);

    if (recipeTagsError) {
      throw new Error(`Erreur lors de la récupération des recettes liées au tag source: ${recipeTagsError.message}`);
    }

    // Préparer les nouvelles relations pour le tag de destination (articles)
    const articleInserts = (articleTags || []).map(item => ({
      article_id: item.article_id,
      tag_id: destinationId
    }));

    // Préparer les nouvelles relations pour le tag de destination (recettes)
    const recipeInserts = (recipeTags || []).map(item => ({
      recipe_id: item.recipe_id,
      tag_id: destinationId
    }));

    // Insérer les nouvelles relations pour les articles
    if (articleInserts.length > 0) {
      // D'abord vérifier les relations existantes pour éviter les doublons
      for (const insert of articleInserts) {
        const { data: existingRelation, error: checkError } = await supabase
          .from('article_tags')
          .select('*')
          .eq('article_id', insert.article_id)
          .eq('tag_id', destinationId)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`Erreur lors de la vérification de relation existante: ${checkError.message}`);
        }

        // N'insérer que si la relation n'existe pas déjà
        if (!existingRelation) {
          const { error: insertError } = await supabase
            .from('article_tags')
            .insert(insert);

          if (insertError) {
            console.error(`Erreur lors de l'insertion de la relation article-tag: ${insertError.message}`);
          }
        }
      }
    }

    // Insérer les nouvelles relations pour les recettes
    if (recipeInserts.length > 0) {
      // D'abord vérifier les relations existantes pour éviter les doublons
      for (const insert of recipeInserts) {
        const { data: existingRelation, error: checkError } = await supabase
          .from('recipe_tags')
          .select('*')
          .eq('recipe_id', insert.recipe_id)
          .eq('tag_id', destinationId)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`Erreur lors de la vérification de relation existante: ${checkError.message}`);
        }

        // N'insérer que si la relation n'existe pas déjà
        if (!existingRelation) {
          const { error: insertError } = await supabase
            .from('recipe_tags')
            .insert(insert);

          if (insertError) {
            console.error(`Erreur lors de l'insertion de la relation recette-tag: ${insertError.message}`);
          }
        }
      }
    }

    // Supprimer les anciennes relations pour les articles
    if (articleTags && articleTags.length > 0) {
      const { error: deleteArticleTagsError } = await supabase
        .from('article_tags')
        .delete()
        .eq('tag_id', sourceId);

      if (deleteArticleTagsError) {
        console.error(`Erreur lors de la suppression des relations article-tag: ${deleteArticleTagsError.message}`);
      }
    }

    // Supprimer les anciennes relations pour les recettes
    if (recipeTags && recipeTags.length > 0) {
      const { error: deleteRecipeTagsError } = await supabase
        .from('recipe_tags')
        .delete()
        .eq('tag_id', sourceId);

      if (deleteRecipeTagsError) {
        console.error(`Erreur lors de la suppression des relations recette-tag: ${deleteRecipeTagsError.message}`);
      }
    }

    // Supprimer le tag source
    const { error: deleteTagError } = await supabase
      .from('tags')
      .delete()
      .eq('id', sourceId);

    if (deleteTagError) {
      throw new Error(`Erreur lors de la suppression du tag source: ${deleteTagError.message}`);
    }

    // Compter les articles liés au tag de destination
    const { count: articlesCount, error: articlesCountError } = await supabase
      .from('article_tags')
      .select('article_id', { count: 'exact', head: true })
      .eq('tag_id', destinationId);

    if (articlesCountError) {
      console.error(`Erreur lors du comptage des articles: ${articlesCountError.message}`);
    }

    // Compter les recettes liées au tag de destination
    const { count: recettesCount, error: recettesCountError } = await supabase
      .from('recipe_tags')
      .select('recipe_id', { count: 'exact', head: true })
      .eq('tag_id', destinationId);

    if (recettesCountError) {
      console.error(`Erreur lors du comptage des recettes: ${recettesCountError.message}`);
    }

    // Récupérer le tag de destination mis à jour
    const { data: tagMisAJour, error: getTagError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', destinationId)
      .single();

    if (getTagError) {
      throw new Error(`Erreur lors de la récupération du tag mis à jour: ${getTagError.message}`);
    }

    // Formater la réponse pour correspondre à l'ancien format
    const formattedTag = {
      ...tagMisAJour,
      _count: {
        articles: articlesCount || 0,
        recettes: recettesCount || 0
      }
    };

    return NextResponse.json(formattedTag);
  } catch (error) {
    console.error('Erreur lors de la fusion des tags:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la fusion des tags', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}