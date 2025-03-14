import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Récupérer l'authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Aucun token fourni' },
        { status: 401 }
      );
    }
    
    // URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Envoyer la requête au backend
    const response = await fetch(`${backendUrl}/api/admin/validate-session`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      // Transférer également le body s'il existe
      body: await request.text(),
    });
    
    // Si la réponse n'est pas ok, retourner une erreur
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }
    
    // Retourner la réponse du backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la validation de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation de la session' },
      { status: 500 }
    );
  }
} 