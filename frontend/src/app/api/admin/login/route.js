import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Extraire les données de connexion du corps de la requête
    const credentials = await request.json();
    
    if (!credentials || !credentials.email || !credentials.password) {
      return NextResponse.json(
        { error: 'Identifiants incomplets' },
        { status: 400 }
      );
    }
    
    // URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Envoyer la requête au backend
    const response = await fetch(`${backendUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    // Si la réponse n'est pas ok, retourner une erreur
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      return NextResponse.json(
        { error: errorData.message || `Erreur ${response.status}` },
        { status: response.status }
      );
    }
    
    // Retourner la réponse du backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la connexion admin:', error);
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur' },
      { status: 500 }
    );
  }
} 