import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const dossierSchema = z.object({
  nom: z.string().min(1, 'Le nom du dossier est requis'),
  description: z.string().optional(),
});

export async function GET() {
  try {
    // Récupération des dossiers avec Supabase
    const { data: dossiers, error } = await supabase
      .from('dossiers_media')
      .select(`
        *,
        medias(count)
      `)
      .order('nom');

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    // Formatage des données pour correspondre à l'attente de l'application
    const formattedDossiers = dossiers.map(dossier => ({
      ...dossier,
      _count: {
        medias: dossier.medias.count
      }
    }));

    return NextResponse.json(formattedDossiers);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des dossiers:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des dossiers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = dossierSchema.parse(data);

    // Vérifier si le dossier existe déjà
    const { data: existingDossier, error: checkError } = await supabase
      .from('dossiers_media')
      .select('id')
      .eq('nom', validatedData.nom)
      .single();

    if (existingDossier) {
      return NextResponse.json(
        { error: 'Un dossier avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Créer le dossier
    const { data: dossier, error } = await supabase
      .from('dossiers_media')
      .insert({
        nom: validatedData.nom,
        description: validatedData.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création du dossier: ${error.message}`);
    }

    return NextResponse.json(dossier);
  } catch (error: any) {
    console.error('Erreur lors de la création du dossier:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du dossier' },
      { status: 500 }
    );
  }
}