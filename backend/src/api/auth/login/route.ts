import { NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';

// Schéma de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export async function POST(request: Request) {
  try {
    console.log('Tentative de connexion...');
    const data = await request.json();
    console.log('Données reçues:', JSON.stringify(data));
    
    // Valider les données
    const validatedData = loginSchema.parse(data);
    console.log('Données validées');

    // Rechercher l'utilisateur dans la base de données
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      console.log('Utilisateur non trouvé');
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      console.log('Mot de passe incorrect');
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Note : La vérification isActive sera implémentée après la migration
    // Pour l'instant tous les utilisateurs sont considérés comme actifs
    
    // Créer un token JWT
    const tokenData = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(
      tokenData,
      process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production',
      { expiresIn: '7d' } // 7 jours
    );

    // Exclure le mot de passe de l'objet utilisateur
    const { password, ...userWithoutPassword } = user;

    console.log('Connexion réussie pour:', user.email);

    return NextResponse.json({
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}