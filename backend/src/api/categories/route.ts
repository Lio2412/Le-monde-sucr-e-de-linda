import { NextResponse } from 'next/server';
import { supabase, generateUUID } from '@/lib/supabase';
import { z } from 'zod';

// Schéma de validation pour une catégorie
const categorySchema = z.object({
  name: z.string().min(2, 'Le nom de la catégorie doit contenir au moins 2 caractères'),
});

export async function GET() {
  try {
    // Récupérer toutes les catégories avec Supabase
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = categorySchema.parse(data);

    // Vérifier si la catégorie existe déjà
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', validatedData.name)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Erreur lors de la vérification de la catégorie: ${checkError.message}`);
    }

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Cette catégorie existe déjà' },
        { status: 400 }
      );
    }

    // Créer la catégorie avec un UUID généré
    const newCategory = {
      id: generateUUID(),
      name: validatedData.name
    };

    const { data: category, error: insertError } = await supabase
      .from('categories')
      .insert(newCategory)
      .select()
      .single();

    if (insertError) {
      throw new Error(`Erreur lors de la création de la catégorie: ${insertError.message}`);
    }

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}