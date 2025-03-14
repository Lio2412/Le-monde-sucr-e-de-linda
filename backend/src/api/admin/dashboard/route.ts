/**
 * API Route: /api/admin/dashboard
 * Fournit des statistiques générales pour le tableau de bord administrateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '@/lib/auth';

// Récupération des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Fonction pour obtenir des statistiques sur les recettes
async function getRecipesStats(supabase: any) {
  try {
    // Nombre total de recettes
    const { count: totalRecipes, error: countError } = await supabase
      .from('recettes')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Récupérer les 5 recettes les plus récentes
    const { data: recentRecipes, error: recentError } = await supabase
      .from('recettes')
      .select('id, titre, date_creation, vues')
      .order('date_creation', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    // Récupérer les 5 recettes les plus populaires
    const { data: popularRecipes, error: popularError } = await supabase
      .from('recettes')
      .select('id, titre, vues')
      .order('vues', { ascending: false })
      .limit(5);

    if (popularError) throw popularError;

    return {
      totalRecipes,
      recentRecipes,
      popularRecipes
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques recettes:', error);
    return {
      totalRecipes: 0,
      recentRecipes: [],
      popularRecipes: []
    };
  }
}

// Fonction pour obtenir des statistiques sur les utilisateurs
async function getUsersStats(supabase: any) {
  try {
    // Nombre total d'utilisateurs
    const { count: totalUsers, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Utilisateurs récemment inscrits
    const { data: recentUsers, error: recentError } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    // Utilisateurs les plus actifs (basé sur le nombre de commentaires)
    const { data: activeUsers, error: activeError } = await supabase
      .from('profiles')
      .select('id, full_name, commentaires_count')
      .order('commentaires_count', { ascending: false })
      .limit(5);

    if (activeError) throw activeError;

    return {
      totalUsers,
      recentUsers,
      activeUsers
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques utilisateurs:', error);
    return {
      totalUsers: 0,
      recentUsers: [],
      activeUsers: []
    };
  }
}

// Fonction pour obtenir des statistiques sur les commentaires
async function getCommentsStats(supabase: any) {
  try {
    // Nombre total de commentaires
    const { count: totalComments, error: countError } = await supabase
      .from('commentaires')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Commentaires récents
    const { data: recentComments, error: recentError } = await supabase
      .from('commentaires')
      .select('id, contenu, date_creation, user_id, recette_id')
      .order('date_creation', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    // Commentaires en attente de modération
    const { data: pendingComments, error: pendingError } = await supabase
      .from('commentaires')
      .select('id, contenu, date_creation, user_id, recette_id')
      .eq('statut', 'en_attente')
      .limit(5);

    if (pendingError) throw pendingError;

    return {
      totalComments,
      recentComments,
      pendingComments
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques commentaires:', error);
    return {
      totalComments: 0,
      recentComments: [],
      pendingComments: []
    };
  }
}

export async function GET(request: NextRequest) {
  console.log('📊 API: Demande de statistiques du tableau de bord administrateur');
  
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
    
    // Obtenir les statistiques des recettes, utilisateurs et commentaires
    const [recipesStats, usersStats, commentsStats] = await Promise.all([
      getRecipesStats(supabase),
      getUsersStats(supabase),
      getCommentsStats(supabase)
    ]);
    
    // Calcul de statistiques générales supplémentaires
    const generalStats = {
      totalRecipes: recipesStats.totalRecipes || 0,
      totalUsers: usersStats.totalUsers || 0,
      totalComments: commentsStats.totalComments || 0,
      // Vous pouvez ajouter d'autres métriques globales ici
    };
    
    // Préparation de la réponse
    const dashboardData = {
      generalStats,
      recipes: recipesStats,
      users: usersStats,
      comments: commentsStats,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ Statistiques du tableau de bord générées avec succès');
    return NextResponse.json(dashboardData);
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la génération des statistiques:', error.message);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}
