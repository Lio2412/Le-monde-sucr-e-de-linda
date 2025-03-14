import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/lib/auth';

// Schéma de validation pour un utilisateur
const userSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  image: z.string().url('URL d\'image invalide').optional(),
  role: z.enum([UserRole.USER, UserRole.ADMIN]).default(UserRole.USER),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Construction de la requête Supabase
    let query = supabase
      .from('users')
      .select(`
        id, 
        name, 
        email, 
        image, 
        role, 
        created_at, 
        updated_at,
        recipes:recettes(id)
      `, { count: 'exact' });
    
    // Ajout de la recherche par nom ou email
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Ajout de la pagination et exécution de la requête
    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }

    // Formater les données pour la compatibilité avec le frontend
    const formattedUsers = users ? users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      _count: {
        recipes: user.recipes ? user.recipes.length : 0
      }
    })) : [];

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        page,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = userSchema.parse(data);

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('email')
      .eq('email', validatedData.email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cette adresse email existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password || 'defaultPassword123', 10);

    // Préparation des données utilisateur
    const userData = {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      image: validatedData.image,
      role: validatedData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Créer l'utilisateur avec Supabase
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(userData)
      .select('id, name, email, image, role, created_at, updated_at')
      .single();

    if (createError) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${createError.message}`);
    }

    // Formater les données pour la compatibilité avec le frontend
    const formattedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      image: newUser.image,
      role: newUser.role,
      createdAt: newUser.created_at,
      updatedAt: newUser.updated_at
    };

    return NextResponse.json(formattedUser, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}