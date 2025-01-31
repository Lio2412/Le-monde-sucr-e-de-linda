import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simuler des données de test
    const articles = [
      {
        id: 1,
        title: 'Tarte aux fraises',
        content: 'Une délicieuse tarte aux fraises de saison',
        createdAt: new Date().toISOString(),
      },
      // Autres articles...
    ];

    return NextResponse.json(articles, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}
