import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Vérifier si l'email existe
    const subscription = await prisma.newsletter.findUnique({
      where: { email }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Cet email n\'est pas inscrit à la newsletter' },
        { status: 404 }
      );
    }

    // Mettre à jour l'inscription
    await prisma.newsletter.update({
      where: { email },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({
      message: 'Désinscription de la newsletter réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la désinscription de la newsletter:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la désinscription de la newsletter' },
      { status: 500 }
    );
  }
} 