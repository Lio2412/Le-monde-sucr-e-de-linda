/**
 * API Route: /api/admin/recipes
 * Gestion des recettes pour l'administration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '@/lib/auth';

// Récupération des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

/**
 * GET /api/admin/recipes
 * Récupère la liste des recettes avec pagination et filtres
 */
export async function GET(request: NextRequest) {
  console.log('📋 API: Récupération des recettes pour l\'administration');
  
  // Vérification de l'authentification administrateur
  const authResult = await verifyAdminToken(request);
  if (!authResult.success) {
    console.error('❌ Authentification admin échouée:', authResult.message);
    return NextResponse.json(
      { error: 'Non autorisé', message: authResult.message },
      { status: 401 }
    );
  }
  
  try {
    // Création du client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Récupération des paramètres de pagination et de filtrage
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const searchTerm = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('categoryId');
    const sortBy = url.searchParams.get('sortBy') || 'date_creation';
    const sortDirection = url.searchParams.get('sortDirection') || 'desc';
    
    // Calcul de l'offset pour la pagination
    const offset = (page - 1) * pageSize;
    
    // Construction de la requête de base
    let query = supabase
      .from('recettes')
      .select(`
        *,
        categories(id, nom),
        tags(id, nom)
      `, { count: 'exact' });
    
    // Ajout des filtres si présents
    if (searchTerm) {
      query = query.ilike('titre', `%${searchTerm}%`);
    }
    
    if (categoryId) {
      query = query.eq('categorie_id', categoryId);
    }
    
    // Ajout du tri
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Ajout de la pagination
    query = query.range(offset, offset + pageSize - 1);
    
    // Exécution de la requête
    const { data: recipes, count, error } = await query;
    
    if (error) throw error;
    
    // Préparation de la réponse
    const totalPages = Math.ceil((count || 0) / pageSize);
    
    const response = {
      recipes,
      pagination: {
        page,
        pageSize,
        totalItems: count || 0,
        totalPages
      },
      filters: {
        search: searchTerm,
        categoryId,
        sortBy,
        sortDirection
      }
    };
    
    console.log(`✅ Récupération de ${recipes?.length || 0} recettes (page ${page}/${totalPages})`);
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des recettes:', error.message);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/recipes
 * Crée une nouvelle recette
 */
export async function POST(request: NextRequest) {
  console.log('➕ API: Création d\'une nouvelle recette');
  
  // Vérification de l'authentification administrateur
  const authResult = await verifyAdminToken(request);
  if (!authResult.success) {
    console.error('❌ Authentification admin échouée:', authResult.message);
    return NextResponse.json(
      { error: 'Non autorisé', message: authResult.message },
      { status: 401 }
    );
  }
  
  try {
    // Création du client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Récupération des données de la recette depuis le corps de la requête
    const recipeData = await request.json();
    
    // Validation des données (à adapter selon vos besoins)
    if (!recipeData.titre) {
      return NextResponse.json(
        { error: 'Données invalides', message: 'Le titre de la recette est requis' },
        { status: 400 }
      );
    }
    
    // Préparation des données pour l'insertion
    const newRecipe = {
      titre: recipeData.titre,
      description: recipeData.description || '',
      instructions: recipeData.instructions || '',
      temps_preparation: recipeData.temps_preparation || 0,
      temps_cuisson: recipeData.temps_cuisson || 0,
      difficulte: recipeData.difficulte || 'FACILE',
      portions: recipeData.portions || 1,
      image_url: recipeData.image_url || null,
      categorie_id: recipeData.categorie_id || null,
      statut: recipeData.statut || 'BROUILLON',
      ingredients: recipeData.ingredients || [],
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString(),
      user_id: authResult.userId // Associer la recette à l'administrateur qui la crée
    };
    
    // Insertion de la recette
    const { data: recipe, error } = await supabase
      .from('recettes')
      .insert(newRecipe)
      .select()
      .single();
    
    if (error) throw error;
    
    // Gestion des tags si présents
    if (recipeData.tags && Array.isArray(recipeData.tags) && recipeData.tags.length > 0) {
      const tagRelations = recipeData.tags.map((tagId: string) => ({
        recette_id: recipe.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('recettes_tags')
        .insert(tagRelations);
      
      if (tagError) {
        console.error('Avertissement: Erreur lors de l\'association des tags:', tagError.message);
      }
    }
    
    console.log(`✅ Recette "${recipe.titre}" créée avec succès (ID: ${recipe.id})`);
    return NextResponse.json({ 
      message: 'Recette créée avec succès', 
      recipe,
      success: true 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de la recette:', error.message);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/recipes
 * Met à jour une recette existante
 */
export async function PUT(request: NextRequest) {
  console.log('🔄 API: Mise à jour d\'une recette');
  
  // Vérification de l'authentification administrateur
  const authResult = await verifyAdminToken(request);
  if (!authResult.success) {
    console.error('❌ Authentification admin échouée:', authResult.message);
    return NextResponse.json(
      { error: 'Non autorisé', message: authResult.message },
      { status: 401 }
    );
  }
  
  try {
    // Création du client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Récupération des données de la recette depuis le corps de la requête
    const recipeData = await request.json();
    
    // Validation des données
    if (!recipeData.id) {
      return NextResponse.json(
        { error: 'Données invalides', message: 'L\'ID de la recette est requis' },
        { status: 400 }
      );
    }
    
    // Préparation des données pour la mise à jour
    const updatedRecipe = {
      ...(recipeData.titre && { titre: recipeData.titre }),
      ...(recipeData.description !== undefined && { description: recipeData.description }),
      ...(recipeData.instructions !== undefined && { instructions: recipeData.instructions }),
      ...(recipeData.temps_preparation !== undefined && { temps_preparation: recipeData.temps_preparation }),
      ...(recipeData.temps_cuisson !== undefined && { temps_cuisson: recipeData.temps_cuisson }),
      ...(recipeData.difficulte && { difficulte: recipeData.difficulte }),
      ...(recipeData.portions !== undefined && { portions: recipeData.portions }),
      ...(recipeData.image_url !== undefined && { image_url: recipeData.image_url }),
      ...(recipeData.categorie_id !== undefined && { categorie_id: recipeData.categorie_id }),
      ...(recipeData.statut && { statut: recipeData.statut }),
      ...(recipeData.ingredients !== undefined && { ingredients: recipeData.ingredients }),
      date_modification: new Date().toISOString()
    };
    
    // Mise à jour de la recette
    const { data: recipe, error } = await supabase
      .from('recettes')
      .update(updatedRecipe)
      .eq('id', recipeData.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Mise à jour des tags si présents
    if (recipeData.tags && Array.isArray(recipeData.tags)) {
      // Supprimer les relations de tags existantes
      const { error: deleteError } = await supabase
        .from('recettes_tags')
        .delete()
        .eq('recette_id', recipeData.id);
      
      if (deleteError) {
        console.error('Avertissement: Erreur lors de la suppression des tags existants:', deleteError.message);
      }
      
      // Ajouter les nouvelles relations de tags
      if (recipeData.tags.length > 0) {
        const tagRelations = recipeData.tags.map((tagId: string) => ({
          recette_id: recipeData.id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('recettes_tags')
          .insert(tagRelations);
        
        if (tagError) {
          console.error('Avertissement: Erreur lors de l\'association des tags:', tagError.message);
        }
      }
    }
    
    console.log(`✅ Recette "${recipe.titre}" mise à jour avec succès (ID: ${recipe.id})`);
    return NextResponse.json({ 
      message: 'Recette mise à jour avec succès', 
      recipe,
      success: true 
    });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la mise à jour de la recette:', error.message);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/recipes
 * Supprime une recette
 */
export async function DELETE(request: NextRequest) {
  console.log('🗑️ API: Suppression d\'une recette');
  
  // Vérification de l'authentification administrateur
  const authResult = await verifyAdminToken(request);
  if (!authResult.success) {
    console.error('❌ Authentification admin échouée:', authResult.message);
    return NextResponse.json(
      { error: 'Non autorisé', message: authResult.message },
      { status: 401 }
    );
  }
  
  try {
    // Création du client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Récupération de l'ID de la recette depuis les paramètres de l'URL
    const url = new URL(request.url);
    const recipeId = url.searchParams.get('id');
    
    if (!recipeId) {
      return NextResponse.json(
        { error: 'Paramètres manquants', message: 'L\'ID de la recette est requis' },
        { status: 400 }
      );
    }
    
    // Suppression des relations de tags
    const { error: tagError } = await supabase
      .from('recettes_tags')
      .delete()
      .eq('recette_id', recipeId);
    
    if (tagError) {
      console.error('Avertissement: Erreur lors de la suppression des relations de tags:', tagError.message);
    }
    
    // Suppression des commentaires associés
    const { error: commentError } = await supabase
      .from('commentaires')
      .delete()
      .eq('recette_id', recipeId);
    
    if (commentError) {
      console.error('Avertissement: Erreur lors de la suppression des commentaires:', commentError.message);
    }
    
    // Suppression de la recette
    const { error } = await supabase
      .from('recettes')
      .delete()
      .eq('id', recipeId);
    
    if (error) throw error;
    
    console.log(`✅ Recette supprimée avec succès (ID: ${recipeId})`);
    return NextResponse.json({ 
      message: 'Recette supprimée avec succès',
      success: true 
    });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression de la recette:', error.message);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}
