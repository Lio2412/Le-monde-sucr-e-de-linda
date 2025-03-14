import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/lib/auth';

// Schéma de validation pour la mise à jour d'un utilisateur
const updateUserSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  email: z.string().email('Adresse email invalide').optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  image: z.string().url('URL d\'image invalide').optional().nullable(),
  role: z.enum([UserRole.USER, UserRole.ADMIN]).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Récupérer les informations de l'utilisateur avec Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, 
        name, 
        email, 
        image, 
        role, 
        created_at, 
        updated_at,
        recipes:recettes (
          id, 
          title, 
          description, 
          image, 
          created_at
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Adapter le format des données pour la compatibilité avec le frontend
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      recipes: user.recipes || [],
      _count: {
        recipes: user.recipes?.length || 0
      }
    };

    return NextResponse.json(formattedUser);
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = updateUserSchema.parse(data);

    // Vérifier si l'utilisateur existe
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', params.id)
      .single();

    if (findError || !existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const { data: emailExists, error: emailCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', validatedData.email)
        .neq('id', params.id)
        .maybeSingle();

      if (emailExists) {
        return NextResponse.json(
          { error: 'Cette adresse email est déjà utilisée par un autre utilisateur' },
          { status: 400 }
        );
      }
    }

    // Préparer les données pour la mise à jour
    const updateData: any = { 
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.email && { email: validatedData.email }),
      ...(validatedData.image !== undefined && { image: validatedData.image }),
      ...(validatedData.role && { role: validatedData.role }),
      updated_at: new Date().toISOString()
    };
    
    // Hasher le nouveau mot de passe si fourni
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10);
    }

    // Mettre à jour l'utilisateur avec Supabase
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', params.id)
      .select('id, name, email, image, role, created_at, updated_at')
      .single();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${updateError.message}`);
    }

    // Formater les données pour la compatibilité avec le frontend
    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    };

    return NextResponse.json(formattedUser);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Vérifier si l'utilisateur existe
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('id', params.id)
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a des recettes
    const { count: recipesCount, error: countError } = await supabase
      .from('recettes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', params.id);

    if (countError) {
      throw new Error(`Erreur lors de la vérification des recettes: ${countError.message}`);
    }

    // Option 2: Supprimer les recettes associées si elles existent
    if (recipesCount && recipesCount > 0) {
      const { error: deleteRecipesError } = await supabase
        .from('recettes')
        .delete()
        .eq('user_id', params.id);

      if (deleteRecipesError) {
        throw new Error(`Erreur lors de la suppression des recettes: ${deleteRecipesError.message}`);
      }
    }

    // Supprimer l'utilisateur
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', params.id);

    if (deleteUserError) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${deleteUserError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}