import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Vérifier si l'email existe déjà
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Cet email est déjà inscrit à la newsletter' },
        { status: 400 }
      );
    }

    // Créer l'inscription
    await prisma.newsletter.create({
      data: {
        email,
        isActive: true
      }
    });

    return NextResponse.json({
      message: 'Inscription à la newsletter réussie'
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription à la newsletter:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription à la newsletter' },
      { status: 500 }
    );
  }
} 