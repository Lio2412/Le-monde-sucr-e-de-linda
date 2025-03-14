import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

interface Commentaire {
  id: string;
  reponses_count?: number;
}

const actionMasseSchema = z.object({
  ids: z.array(z.string()),
  action: z.enum(['approuver', 'rejeter', 'supprimer']),
  motif: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { ids, action, motif } = actionMasseSchema.parse(data);

    // Vérifier que tous les commentaires existent
    const { data: commentaires, error: getError } = await supabase
      .from('commentaires')
      .select('id')
      .in('id', ids);

    if (getError) {
      console.error('Erreur lors de la récupération des commentaires:', getError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commentaires' },
        { status: 500 }
      );
    }

    if (commentaires.length !== ids.length) {
      return NextResponse.json(
        { error: 'Certains commentaires n\'existent pas' },
        { status: 400 }
      );
    }

    // Compter les réponses pour chaque commentaire si l'action est 'supprimer'
    let commentairesAvecReponses: Commentaire[] = [];
    
    if (action === 'supprimer') {
      commentairesAvecReponses = await Promise.all(
        commentaires.map(async (commentaire) => {
          const { count, error: countError } = await supabase
            .from('commentaires')
            .select('id', { count: 'exact', head: true })
            .eq('parent_id', commentaire.id);
          
          if (countError) {
            console.error(`Erreur lors du comptage des réponses pour ${commentaire.id}:`, countError);
          }
          
          return {
            ...commentaire,
            reponses_count: count || 0
          };
        })
      );
    }

    // Effectuer l'action en fonction du type
    switch (action) {
      case 'approuver':
        // Mettre à jour le statut des commentaires à "approuvé"
        const { error: approuveError } = await supabase
          .from('commentaires')
          .update({
            statut: 'approuve',
            updated_at: new Date().toISOString()
          })
          .in('id', ids);

        if (approuveError) {
          throw new Error(`Erreur lors de l'approbation des commentaires: ${approuveError.message}`);
        }
        break;

      case 'rejeter':
        if (!motif) {
          return NextResponse.json(
            { error: 'Le motif est requis pour rejeter des commentaires' },
            { status: 400 }
          );
        }
        
        // Mettre à jour le statut des commentaires à "rejeté" avec le motif
        const { error: rejeterError } = await supabase
          .from('commentaires')
          .update({
            statut: 'rejete',
            motifRejet: motif,
            updated_at: new Date().toISOString()
          })
          .in('id', ids);

        if (rejeterError) {
          throw new Error(`Erreur lors du rejet des commentaires: ${rejeterError.message}`);
        }
        break;

      case 'supprimer':
        // Pour chaque commentaire
        await Promise.all(
          commentairesAvecReponses.map(async (commentaire) => {
            if (commentaire.reponses_count && commentaire.reponses_count > 0) {
              // Si le commentaire a des réponses, on le marque comme supprimé
              const { error: updateError } = await supabase
                .from('commentaires')
                .update({
                  contenu: '[Commentaire supprimé]',
                  auteurNom: '[Supprimé]',
                  auteurEmail: '',
                  statut: 'rejete',
                  updated_at: new Date().toISOString()
                })
                .eq('id', commentaire.id);

              if (updateError) {
                console.error(`Erreur lors de la mise à jour du commentaire ${commentaire.id}:`, updateError);
              }
            } else {
              // Sinon, on le supprime complètement
              const { error: deleteError } = await supabase
                .from('commentaires')
                .delete()
                .eq('id', commentaire.id);

              if (deleteError) {
                console.error(`Erreur lors de la suppression du commentaire ${commentaire.id}:`, deleteError);
              }
            }
          })
        );
        break;
    }

    // Récupérer les commentaires mis à jour (sauf ceux supprimés)
    const { data: commentairesMisAJour, error: getUpdatedError } = await supabase
      .from('commentaires')
      .select(`
        *,
        reponses:reponses_parent_id_fkey(id, contenu, auteurNom, created_at, statut),
        parent:parent_id_fkey(id, contenu, auteurNom, created_at, statut)
      `)
      .in('id', ids);

    if (getUpdatedError) {
      throw new Error(`Erreur lors de la récupération des commentaires mis à jour: ${getUpdatedError.message}`);
    }

    // Formater les données pour inclure le compte des réponses
    const commentairesFormates = await Promise.all(
      (commentairesMisAJour || []).map(async (commentaire) => {
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
          .eq('parent_id', commentaire.id);

        if (countError) {
          console.error(`Erreur lors du comptage des réponses pour ${commentaire.id}:`, countError);
        }

        return {
          ...commentaire,
          _count: {
            reponses: count || 0
          }
        };
      })
    );

    // TODO: Envoyer les notifications appropriées

    return NextResponse.json({
      success: true,
      commentaires: commentairesFormates,
    });
  } catch (error) {
    console.error('Erreur lors de l\'action de masse sur les commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'action de masse sur les commentaires', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}