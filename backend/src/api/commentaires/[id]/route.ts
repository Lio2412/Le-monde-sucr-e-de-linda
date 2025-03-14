import { NextResponse } from 'next/server';
import { commentaireSchema } from '@/services/commentaires.service';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer le commentaire avec ses relations
    const { data: commentaire, error } = await supabase
      .from('commentaires')
      .select(`
        *,
        reponses:reponses_parent_id_fkey(id, contenu, auteurNom, created_at, statut),
        parent:parent_id_fkey(id, contenu, auteurNom, created_at, statut)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    if (!commentaire) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
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

    return NextResponse.json(formattedCommentaire);
  } catch (error) {
    console.error('Erreur lors de la récupération du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du commentaire' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Valider les données
    const validatedData = commentaireSchema.partial().parse(data);

    // Mettre à jour le commentaire
    const { data: updatedCommentaire, error: updateError } = await supabase
      .from('commentaires')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour du commentaire: ${updateError.message}`);
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
      throw new Error(`Erreur lors de la récupération du commentaire mis à jour: ${getError.message}`);
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

    return NextResponse.json(formattedCommentaire);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du commentaire', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier si le commentaire existe et compter ses réponses
    const { data: commentaire, error: getError } = await supabase
      .from('commentaires')
      .select('*')
      .eq('id', params.id)
      .single();

    if (getError) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    // Compter les réponses
    const { count, error: countError } = await supabase
      .from('commentaires')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', params.id);

    if (countError) {
      console.error('Erreur lors du comptage des réponses:', countError);
    }

    // Si le commentaire a des réponses, on le marque comme supprimé au lieu de le supprimer
    if (count && count > 0) {
      const { error: updateError } = await supabase
        .from('commentaires')
        .update({
          contenu: '[Commentaire supprimé]',
          auteurNom: '[Supprimé]',
          auteurEmail: '',
          statut: 'rejete'
        })
        .eq('id', params.id);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour du commentaire: ${updateError.message}`);
      }
    } else {
      // Sinon, on le supprime complètement
      const { error: deleteError } = await supabase
        .from('commentaires')
        .delete()
        .eq('id', params.id);

      if (deleteError) {
        throw new Error(`Erreur lors de la suppression du commentaire: ${deleteError.message}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du commentaire', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}