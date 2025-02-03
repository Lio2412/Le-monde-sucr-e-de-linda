import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { annee: string; mois: string } }
) {
  try {
    const annee = parseInt(params.annee);
    const mois = parseInt(params.mois);

    // Créer les dates de début et de fin du mois
    const dateDebut = new Date(annee, mois - 1, 1);
    const dateFin = new Date(annee, mois, 0);

    const planifications = await prisma.planification.findMany({
      where: {
        datePublication: {
          gte: dateDebut,
          lte: dateFin,
        },
      },
      orderBy: { datePublication: 'asc' },
      include: {
        recette: {
          select: {
            titre: true,
            auteur: {
              select: {
                nom: true,
                email: true,
              },
            },
          },
        },
        article: {
          select: {
            titre: true,
            auteur: {
              select: {
                nom: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Organiser les planifications par jour
    const calendrier = Array.from({ length: dateFin.getDate() }, (_, i) => {
      const jour = i + 1;
      const planificationsJour = planifications.filter(p => 
        p.datePublication.getDate() === jour
      );
      
      return {
        jour,
        planifications: planificationsJour,
      };
    });

    return NextResponse.json({
      annee,
      mois,
      nombreJours: dateFin.getDate(),
      premierJour: dateDebut.getDay(),
      calendrier,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du calendrier:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du calendrier' },
      { status: 500 }
    );
  }
} 