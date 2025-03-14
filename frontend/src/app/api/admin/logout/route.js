import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Récupérer l'authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ success: true, message: 'Déjà déconnecté' });
    }
    
    // URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Envoyer la requête au backend
    const response = await fetch(`${backendUrl}/api/admin/logout`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      // Transférer également le body s'il existe
      body: await request.text(),
    });
    
    // Même si la réponse n'est pas OK, on considère la déconnexion comme réussie
    if (!response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Déconnexion effectuée (session déjà expirée)' 
      });
    }
    
    // Retourner la réponse du backend
    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: data.message || 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    // Même en cas d'erreur, on considère l'utilisateur déconnecté
    return NextResponse.json({ 
      success: true, 
      message: 'Déconnexion effectuée malgré une erreur serveur' 
    });
  }
} 