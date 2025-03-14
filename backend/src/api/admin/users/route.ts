/**
 * API Route: /api/admin/users
 * Gestion des utilisateurs pour l'administration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '@/lib/auth';

// Récupération des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

/**
 * GET /api/admin/users
 * Récupère la liste des utilisateurs avec pagination et filtres
 */
export async function GET(request: NextRequest) {
  console.log('👥 API: Récupération des utilisateurs pour l\'administration');
  
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
    const role = url.searchParams.get('role');
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortDirection = url.searchParams.get('sortDirection') || 'desc';
    
    // Calcul de l'offset pour la pagination
    const offset = (page - 1) * pageSize;
    
    // Construction de la requête de base
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });
    
    // Ajout des filtres si présents
    if (searchTerm) {
      query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
    }
    
    if (role) {
      query = query.eq('role', role);
    }
    
    // Ajout du tri
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Ajout de la pagination
    query = query.range(offset, offset + pageSize - 1);
    
    // Exécution de la requête
    const { data: users, count, error } = await query;
    
    if (error) throw error;
    
    // Préparation de la réponse
    const totalPages = Math.ceil((count || 0) / pageSize);
    
    const response = {
      users,
      pagination: {
        page,
        pageSize,
        totalItems: count || 0,
        totalPages
      },
      filters: {
        search: searchTerm,
        role,
        sortBy,
        sortDirection
      }
    };
    
    console.log(`✅ Récupération de ${users?.length || 0} utilisateurs (page ${page}/${totalPages})`);
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error.message);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users
 * Met à jour un utilisateur existant (informations de profil)
 */
export async function PUT(request: NextRequest) {
  console.log('🔄 API: Mise à jour d\'un utilisateur');
  
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
    
    // Récupération des données de l'utilisateur depuis le corps de la requête
    const userData = await request.json();
    
    // Validation des données
    if (!userData.id) {
      return NextResponse.json(
        { error: 'Données invalides', message: 'L\'ID de l\'utilisateur est requis' },
        { status: 400 }
      );
    }
    
    // Préparation des données pour la mise à jour
    const updatedUser = {
      ...(userData.full_name !== undefined && { full_name: userData.full_name }),
      ...(userData.avatar_url !== undefined && { avatar_url: userData.avatar_url }),
      ...(userData.role !== undefined && { role: userData.role }),
      ...(userData.statut !== undefined && { statut: userData.statut }),
      updated_at: new Date().toISOString()
    };
    
    // Mise à jour de l'utilisateur
    const { data: user, error } = await supabase
      .from('profiles')
      .update(updatedUser)
      .eq('id', userData.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Utilisateur "${user.full_name}" mis à jour avec succès (ID: ${user.id})`);
    return NextResponse.json({ 
      message: 'Utilisateur mis à jour avec succès', 
      user,
      success: true 
    });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error.message);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users/reset-password
 * Réinitialise le mot de passe d'un utilisateur
 */
export async function POST(request: NextRequest) {
  console.log('🔑 API: Réinitialisation du mot de passe d\'un utilisateur');
  
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
    
    // Récupération des données depuis le corps de la requête
    const data = await request.json();
    
    // Validation des données
    if (!data.userId) {
      return NextResponse.json(
        { error: 'Données invalides', message: 'L\'ID de l\'utilisateur est requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', data.userId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé', message: 'L\'utilisateur spécifié n\'existe pas' },
        { status: 404 }
      );
    }
    
    // Réinitialisation du mot de passe
    const { error } = await supabase.auth.resetPasswordForEmail(
      user.email,
      { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password-confirmation` }
    );
    
    if (error) throw error;
    
    console.log(`✅ Email de réinitialisation de mot de passe envoyé à ${user.email}`);
    return NextResponse.json({ 
      message: 'Email de réinitialisation de mot de passe envoyé avec succès',
      success: true 
    });
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la réinitialisation du mot de passe:', error.message);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users
 * Désactive ou supprime un compte utilisateur
 */
export async function DELETE(request: NextRequest) {
  console.log('🗑️ API: Suppression/désactivation d\'un utilisateur');
  
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
    
    // Récupération de l'ID de l'utilisateur depuis les paramètres de l'URL
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');
    const mode = url.searchParams.get('mode') || 'disable'; // 'disable' ou 'delete'
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Paramètres manquants', message: 'L\'ID de l\'utilisateur est requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé', message: 'L\'utilisateur spécifié n\'existe pas' },
        { status: 404 }
      );
    }
    
    // Empêcher la suppression d'un administrateur
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Opération non autorisée', message: 'Impossible de supprimer un compte administrateur' },
        { status: 403 }
      );
    }
    
    if (mode === 'disable') {
      // Désactivation du compte (mise à jour du statut)
      const { error } = await supabase
        .from('profiles')
        .update({ statut: 'DESACTIVE', updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      
      console.log(`✅ Utilisateur désactivé avec succès (ID: ${userId})`);
      return NextResponse.json({ 
        message: 'Utilisateur désactivé avec succès',
        success: true 
      });
      
    } else if (mode === 'delete') {
      // Suppression complète du compte
      // Note: Dans un système réel, il faudrait d'abord supprimer les données associées
      // ou mettre en place des déclencheurs de base de données pour gérer cela
      
      // Suppression du profil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Suppression du compte auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Avertissement: Le profil a été supprimé mais pas le compte auth:', authError.message);
      }
      
      console.log(`✅ Utilisateur supprimé avec succès (ID: ${userId})`);
      return NextResponse.json({ 
        message: 'Utilisateur supprimé avec succès',
        success: true 
      });
    } else {
      return NextResponse.json(
        { error: 'Mode invalide', message: 'Le mode doit être "disable" ou "delete"' },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression/désactivation de l\'utilisateur:', error.message);
    return NextResponse.json(
      { error: 'Erreur serveur', message: error.message },
      { status: 500 }
    );
  }
}
