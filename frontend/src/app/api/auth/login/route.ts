import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    console.log('Tentative de connexion au backend:', `${BACKEND_URL}/api/auth/login`);
    
    // Transmettre la requête au backend
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log('Réponse du backend:', responseData);

    // Retourner la réponse du backend avec le même statut
    return NextResponse.json(responseData, { status: response.status });
    
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
} 