import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Mettre à jour le statut du commentaire à "approuvé"
    const { data: updatedCommentaire, error: updateError } = await supabase
      .from('commentaires')
      .update({ 
        statut: 'approuve',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour du statut du commentaire: ${updateError.message}`);
    }

    // Récupérer le commentaire mis à jour avec ses relations
    const { data: commentaire, error: getError } = await supabase
      .from('commentaires')
      .select(`
        *,
        reponses:reponses_parent_id_fkey(id, contenu, auteurNom, created_at, statut),
        parent:parent_id_fkey(id, contenu, auteurNom, created_at, statut)
      `)
      .eq('id', params.id)
      .single();

    if (getError) {
      throw new Error(`Erreur lors de la récupération du commentaire approuvé: ${getError.message}`);
    }

    // Trier les réponses par ordre chronologique
    if (commentaire.reponses) {
      commentaire.reponses.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateA - dateB;
      });
    }

    // Compter le nombre de réponses
    const { count, error: countError } = await supabase
      .from('commentaires')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', params.id);

    if (countError) {
      console.error('Erreur lors du comptage des réponses:', countError);
    }

    // Formater le résultat pour correspondre à l'ancien format
    const formattedCommentaire = {
      ...commentaire,
      _count: {
        reponses: count || 0
      }
    };

    // TODO: Envoyer une notification à l'auteur

    return NextResponse.json(formattedCommentaire);
  } catch (error) {
    console.error('Erreur lors de l\'approbation du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'approbation du commentaire', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}