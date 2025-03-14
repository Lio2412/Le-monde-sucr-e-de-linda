import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Schéma de validation pour une catégorie
const categorySchema = z.object({
  name: z.string().min(2, 'Le nom de la catégorie doit contenir au moins 2 caractères'),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Récupérer la catégorie avec Supabase
    const { data: category, error } = await supabase
      .from('categories')
      .select('*, recipes(*)')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Compter le nombre de recettes pour cette catégorie
    const { count: recipesCount, error: countError } = await supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', params.id);

    if (countError) {
      console.error('Erreur lors du comptage des recettes:', countError);
    }

    // Formater les données pour correspondre à l'ancien format
    const formattedCategory = {
      ...category,
      _count: {
        recipes: recipesCount || 0
      }
    };

    return NextResponse.json(formattedCategory);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la catégorie' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = categorySchema.parse(data);

    // Vérifier si une autre catégorie avec le même nom existe déjà
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', validatedData.name)
      .neq('id', params.id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Erreur lors de la vérification de la catégorie: ${checkError.message}`);
    }

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Une autre catégorie avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Mettre à jour la catégorie
    const { data: updatedCategory, error: updateError } = await supabase
      .from('categories')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour de la catégorie: ${updateError.message}`);
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Vérifier si la catégorie est utilisée par des recettes
    const { count: recipesCount, error: countError } = await supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', params.id);

    if (countError) {
      throw new Error(`Erreur lors du comptage des recettes: ${countError.message}`);
    }

    if ((recipesCount || 0) > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer cette catégorie car elle est utilisée par des recettes' },
        { status: 400 }
      );
    }

    // Supprimer la catégorie
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      throw new Error(`Erreur lors de la suppression de la catégorie: ${deleteError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
}