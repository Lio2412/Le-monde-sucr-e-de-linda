import { NextResponse } from 'next/server';
import { verifyToken } from '../../../utils/auth';
import { prisma } from '../../../utils/prisma';

export async function GET(request: Request) {
  try {
    console.log('Tentative de récupération de l\'utilisateur courant...');
    
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    console.log('En-tête d\'autorisation:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token d\'authentification manquant ou invalide');
      return NextResponse.json(
        { error: 'Token d\'authentification manquant ou invalide' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extrait');
    
    // Vérifier le token
    const decodedToken = verifyToken(token);
    console.log('Résultat de la vérification du token:', decodedToken ? 'Valide' : 'Invalide');
    
    if (!decodedToken) {
      console.log('Token d\'authentification invalide');
      return NextResponse.json(
        { error: 'Token d\'authentification invalide' },
        { status: 401 }
      );
    }
    console.log('Token décodé:', JSON.stringify(decodedToken));

    // Récupérer l'utilisateur depuis la base de données avec Prisma
    console.log('Recherche de l\'utilisateur avec ID:', decodedToken.userId);
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      include: {
        // Inclure le nombre de recettes (à adapter selon votre modèle Prisma)
        _count: {
          select: {
            recipes: true
          }
        }
      }
    });

    if (!user) {
      console.log('Utilisateur non trouvé');
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    console.log('Utilisateur trouvé:', user.email);

    // Exclure le mot de passe avant de renvoyer la réponse
    const { password, ...userWithoutPassword } = user;
    
    // Reformater la réponse pour correspondre au format attendu par le frontend
    const formattedUser = {
      ...userWithoutPassword,
      recipes: user._count.recipes
    };

    return NextResponse.json(formattedUser);
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de l\'utilisateur actuel' },
      { status: 500 }
    );
  }
}