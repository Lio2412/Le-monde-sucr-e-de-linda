import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const signalerSchema = z.object({
  motif: z.string().min(1, 'Le motif est requis'),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { motif } = signalerSchema.parse(data);

    // Récupérer le commentaire actuel
    const { data: commentaireActuel, error: getError } = await supabase
      .from('commentaires')
      .select('metadata')
      .eq('id', params.id)
      .single();

    if (getError || !commentaireActuel) {
      console.error('Erreur lors de la récupération du commentaire:', getError);
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour les métadonnées du commentaire
    const metadata = {
      ...commentaireActuel.metadata,
      signalements: (commentaireActuel.metadata?.signalements || 0) + 1,
      motifsSignalement: [
        ...(commentaireActuel.metadata?.motifsSignalement || []),
        motif,
      ],
    };

    // Déterminer le nouveau statut si nécessaire
    const nouveauStatut = metadata.signalements >= 3 ? 'signale' : undefined;
    
    // Préparer les données de mise à jour
    const updateData: any = { 
      metadata,
      updated_at: new Date().toISOString()
    };
    
    // N'ajouter le statut que s'il doit être modifié
    if (nouveauStatut) {
      updateData.statut = nouveauStatut;
    }

    // Mettre à jour le commentaire
    const { data: updatedCommentaire, error: updateError } = await supabase
      .from('commentaires')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour du commentaire: ${updateError.message}`);
    }

    // Récupérer le commentaire mis à jour avec ses relations
    const { data: commentaire, error: getFullError } = await supabase
      .from('commentaires')
      .select(`
        *,
        reponses:reponses_parent_id_fkey(id, contenu, auteurNom, created_at, statut),
        parent:parent_id_fkey(id, contenu, auteurNom, created_at, statut)
      `)
      .eq('id', params.id)
      .single();

    if (getFullError) {
      throw new Error(`Erreur lors de la récupération du commentaire signalé: ${getFullError.message}`);
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

    // TODO: Envoyer une notification aux modérateurs si le seuil de signalements est atteint

    return NextResponse.json(formattedCommentaire);
  } catch (error) {
    console.error('Erreur lors du signalement du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors du signalement du commentaire', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}