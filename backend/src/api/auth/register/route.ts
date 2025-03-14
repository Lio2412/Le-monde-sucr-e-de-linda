import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../utils/prisma';
import { Role } from '../../../types/prisma';
import { hashPassword, generateToken } from '../../../utils/auth';

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

/**
 * Gestionnaire pour l'inscription d'un nouvel utilisateur
 * @param request Requête HTTP
 * @returns Réponse HTTP avec les données utilisateur et le token
 */
export async function POST(request: Request) {
  try {
    // Récupérer et valider les données
    const data = await request.json();
    const validatedData = registerSchema.parse(data);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cette adresse email existe déjà' },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(validatedData.password);

    // Créer l'utilisateur dans la base de données
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: Role.USER // Rôle par défaut
      }
    });

    // Générer un token JWT
    const token = generateToken(user);

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}