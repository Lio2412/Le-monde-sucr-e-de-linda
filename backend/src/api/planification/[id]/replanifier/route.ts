import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const replanifierSchema = z.object({
  datePublication: z.string().transform((date) => new Date(date)),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { datePublication } = replanifierSchema.parse(data);

    // Mise à jour de la planification avec Supabase
    const { data: planification, error } = await supabase
      .from('planifications')
      .update({ 
        date_publication: datePublication.toISOString(),
        statut: 'planifie',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select(`
        *,
        recette:recettes (
          titre,
          auteur:users (
            nom,
            email
          )
        ),
        article:articles (
          titre,
          auteur:users (
            nom,
            email
          )
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erreur lors de la replanification: ${error.message}`);
    }

    if (!planification) {
      return NextResponse.json(
        { error: 'Planification non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(planification);
  } catch (error: any) {
    console.error('Erreur lors de la replanification:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la replanification' },
      { status: 500 }
    );
  }
}