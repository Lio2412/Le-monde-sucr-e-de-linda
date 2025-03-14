import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Aucune URL n\'a été fournie' },
        { status: 400 }
      );
    }

    // Vérifier que l'URL est valide
    const imageResponse = await fetch(url);
    if (!imageResponse.ok) {
      throw new Error('Impossible de récupérer l\'image');
    }

    // Vérifier que c'est bien une image
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw new Error('Le fichier n\'est pas une image');
    }

    // Retourner l'URL
    return NextResponse.json({
      success: 1,
      file: {
        url: url
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'image' },
      { status: 500 }
    );
  }
} 