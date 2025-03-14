import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Création d'un client Supabase avec les droits administrateur (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || '', 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET() {
  try {
    console.log('Initialisation de l\'administrateur...');
    
    // Étape 1: Vérifier si l'administrateur existe déjà dans la table auth.users
    const { data: authUsers, error: authSearchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authSearchError) {
      console.error('Erreur lors de la recherche de l\'utilisateur auth:', authSearchError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erreur lors de la recherche de l\'utilisateur auth',
          error: authSearchError.message
        },
        { status: 500 }
      );
    }
    
    // Rechercher l'utilisateur admin@example.com
    const adminUser = authUsers.users.find(user => user.email === 'admin@example.com');
    let adminUserId = adminUser?.id;
    
    // Si l'administrateur n'existe pas encore dans auth.users, le créer
    if (!adminUserId) {
      console.log('Création d\'un nouvel utilisateur admin dans auth.users...');
      const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: 'admin@example.com',
        password: 'admin123',
        email_confirm: true
      });
      
      if (createAuthError) {
        console.error('Erreur lors de la création de l\'utilisateur auth:', createAuthError);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Erreur lors de la création de l\'utilisateur auth',
            error: createAuthError.message
          },
          { status: 500 }
        );
      }
      
      adminUserId = newAuthUser.user.id;
    }
    
    if (!adminUserId) {
      console.error('Impossible d\'obtenir un ID utilisateur valide');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Impossible d\'obtenir un ID utilisateur valide'
        },
        { status: 500 }
      );
    }
    
    // Étape 2: Vérifier si un profil administrateur existe déjà
    const { data: existingProfile, error: profileSearchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', adminUserId)
      .maybeSingle();
      
    if (profileSearchError) {
      console.error('Erreur lors de la recherche du profil:', profileSearchError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erreur lors de la recherche du profil',
          error: profileSearchError.message
        },
        { status: 500 }
      );
    }
    
    // Si le profil existe déjà, mettre à jour le rôle si nécessaire
    if (existingProfile) {
      console.log('Profil administrateur trouvé, vérification du rôle...');
      
      if (existingProfile.role !== 'ADMIN') {
        console.log('Mise à jour du rôle administrateur...');
        const { data: updatedProfile, error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ role: 'ADMIN' })
          .eq('id', adminUserId)
          .select()
          .single();
          
        if (updateError) {
          console.error('Erreur lors de la mise à jour du rôle:', updateError);
          return NextResponse.json(
            { 
              success: false, 
              message: 'Erreur lors de la mise à jour du rôle',
              error: updateError.message
            },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Rôle administrateur mis à jour avec succès',
          admin: updatedProfile
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Le profil administrateur existe déjà',
        admin: existingProfile
      });
    }
    
    // Étape 3: Si le profil n'existe pas, le créer avec l'ID utilisateur existant
    console.log('Création d\'un nouveau profil administrateur...');
    const profileData = {
      id: adminUserId,
      email: 'admin@example.com',
      prenom: 'Super',
      nom: 'Admin',
      pseudo: 'Administrateur',
      role: 'ADMIN',
      avatar_url: null
    };
    
    const { data: newProfile, error: createProfileError } = await supabaseAdmin
      .from('profiles')
      .insert([profileData])
      .select()
      .single();
      
    if (createProfileError) {
      console.error('Erreur lors de la création du profil:', createProfileError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erreur lors de la création du profil administrateur',
          error: createProfileError.message
        },
        { status: 500 }
      );
    }
    
    console.log('Administrateur initialisé avec succès');
    return NextResponse.json({
      success: true,
      message: 'Administrateur initialisé avec succès',
      admin: newProfile
    });
    
  } catch (error: any) {
    console.error('Erreur lors de l\'initialisation de l\'administrateur:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de l\'initialisation de l\'administrateur',
        error: error.message
      },
      { status: 500 }
    );
  }
}
