import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../utils/auth';
import { Role } from '../../../types/prisma';

export async function GET(request: NextRequest) {
  try {
    // Extraire le token d'autorisation de l'en-tête
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant ou invalide' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Vérifier le token
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    // Vérifier si l'utilisateur est un admin
    if (payload.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    // Si tout est valide, renvoyer une réponse positive
    return NextResponse.json({
      message: 'Accès autorisé à la route protégée admin',
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'accès à la route protégée admin:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'authentification' },
      { status: 500 }
    );
  }
}
