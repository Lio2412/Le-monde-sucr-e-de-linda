import { NextResponse } from 'next/server';
import { mediaSchema } from '@/services/medias.service';
import { supabase } from '@/lib/supabase';
import { getImageMetadata } from '@/lib/image';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const dossier = searchParams.get('dossier');

    const skip = (page - 1) * limit;

    // Construction de la requête Supabase
    let query = supabase
      .from('medias')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    // Ajout des filtres conditionnels
    if (search) {
      query = query.or(`nom.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (dossier) {
      query = query.eq('dossier', dossier);
    }

    // Exécution de la requête
    const { data: medias, count, error } = await query;

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    return NextResponse.json({
      medias,
      pagination: {
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        page,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des médias:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des médias' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider les données
    const validatedData = mediaSchema.parse(data);

    // Si c'est une image, récupérer les métadonnées
    let metadata = {};
    if (validatedData.type === 'image' && validatedData.url) {
      try {
        // Utilisation de as any pour éviter l'erreur de type
        metadata = await getImageMetadata(validatedData.url as any);
      } catch (err) {
        console.error('Erreur lors de la récupération des métadonnées de l\'image:', err);
        // Continuer sans métadonnées en cas d'erreur
      }
    }

    // Création du média avec Supabase
    const { data: media, error } = await supabase
      .from('medias')
      .insert({
        ...validatedData,
        metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création du média: ${error.message}`);
    }

    return NextResponse.json(media);
  } catch (error: any) {
    console.error('Erreur lors de la création du média:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du média' },
      { status: 500 }
    );
  }
}