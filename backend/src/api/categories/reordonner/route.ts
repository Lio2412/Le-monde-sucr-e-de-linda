import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const reordonnerSchema = z.object({
  categories: z.array(z.object({
    id: z.string(),
    ordre: z.number(),
  })),
});

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { categories } = reordonnerSchema.parse(data);

    // Vérifier que toutes les catégories existent
    const { data: existingCategories, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .in('id', categories.map(c => c.id));

    if (checkError) {
      throw new Error(`Erreur lors de la vérification des catégories: ${checkError.message}`);
    }

    if (!existingCategories || existingCategories.length !== categories.length) {
      return NextResponse.json(
        { error: 'Certaines catégories n\'existent pas' },
        { status: 400 }
      );
    }

    // Mettre à jour l'ordre des catégories (en séquentiel pour éviter les conflits)
    for (const { id, ordre } of categories) {
      const { error: updateError } = await supabase
        .from('categories')
        .update({ ordre })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour de l'ordre de la catégorie ${id}: ${updateError.message}`);
      }
    }

    // Récupérer les catégories mises à jour
    const { data: updatedCategories, error: fetchError } = await supabase
      .from('categories')
      .select(`
        *,
        parent:parent_id (
          id, name, slug
        )
      `)
      .in('id', categories.map(c => c.id))
      .order('ordre');

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération des catégories mises à jour: ${fetchError.message}`);
    }

    return NextResponse.json(updatedCategories);
  } catch (error) {
    console.error('Erreur lors de la réorganisation des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réorganisation des catégories', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}