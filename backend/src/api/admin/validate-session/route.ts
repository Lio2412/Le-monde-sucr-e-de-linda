import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../utils/prisma';
import { Role } from '../../../types/prisma';

export async function POST(request: Request) {
  try {
    console.log('Validation de session admin...');
    
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      console.log('Aucun token fourni');
      return NextResponse.json(
        { error: 'Aucun token fourni' },
        { status: 401 }
      );
    }
    
    // Vérifier le token JWT
    const secret = process.env.JWT_SECRET || 'UzSnDSiSBV68c2bKmb61Vf3W2ZRJGMF3PcF6KNcff3segMvrnD1Q0E7H746PJ+FohucizXsjea761j/o7mKLhA==';
    
    try {
      const decoded = jwt.verify(token, secret) as { userId: string; email: string; role: string };
      console.log('Token décodé:', decoded);
      
      if (decoded.role !== Role.ADMIN) {
        console.log('Token valide mais pas pour un admin');
        return NextResponse.json(
          { error: 'Accès refusé' },
          { status: 403 }
        );
      }
      
      // Vérifier si l'utilisateur existe toujours et est un admin
      const userProfile = await prisma.user.findUnique({
        where: { 
          id: decoded.userId,
          role: Role.ADMIN,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          role: true
        }
      });
      
      if (!userProfile) {
        console.log('Profil admin non trouvé ou supprimé');
        return NextResponse.json(
          { error: 'Session invalide' },
          { status: 401 }
        );
      }
      
      console.log('Session admin valide pour:', decoded.email);
      return NextResponse.json({
        valid: true,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role
        },
        message: 'Session admin valide'
      });
    } catch (jwtError) {
      console.error('Erreur de vérification du token JWT:', jwtError);
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la validation de session admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation de session' },
      { status: 500 }
    );
  }
}
