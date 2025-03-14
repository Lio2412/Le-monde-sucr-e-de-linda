import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Mise à jour du statut de la planification avec Supabase
    const { data: planification, error } = await supabase
      .from('planifications')
      .update({ 
        statut: 'annule',
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
      throw new Error(`Erreur lors de l'annulation de la planification: ${error.message}`);
    }

    if (!planification) {
      return NextResponse.json(
        { error: 'Planification non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(planification);
  } catch (error: any) {
    console.error('Erreur lors de l\'annulation de la planification:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'annulation de la planification' },
      { status: 500 }
    );
  }
}