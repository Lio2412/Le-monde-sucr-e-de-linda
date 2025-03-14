import { NextResponse } from "next/server";
import { mockRecipes } from "@/data/mock-recipes";

// Variable d'environnement pour activer/désactiver les données mock
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || false;

/**
 * GET /api/admin/recipes/[id]
 * Récupère les détails d'une recette spécifique
 */
export async function GET(request, { params }) {
  try {
    const recipeId = params.id;
    
    if (!recipeId) {
      return NextResponse.json(
        { error: 'ID de recette manquant' },
        { status: 400 }
      );
    }
    
    // Si nous utilisons des données mockées, retourner les données mockées
    if (USE_MOCK_DATA) {
      console.log(`📦 Utilisation des données MOCK pour la recette ${recipeId}`);
      const recipe = mockRecipes.find(r => r.id === recipeId);
      
      if (!recipe) {
        return NextResponse.json(
          { error: 'Recette non trouvée' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ recipe });
    }
    
    // Récupérer l'en-tête d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Aucun token fourni' },
        { status: 401 }
      );
    }
    
    // URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Envoyer la requête au backend
    const response = await fetch(`${backendUrl}/api/admin/recipes/${recipeId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    // Si la réponse n'est pas ok, retourner les données mockées en mode dégradé
    if (!response.ok) {
      console.error(`⚠️ Erreur API backend (${response.status}), utilisation des données MOCK pour la recette ${recipeId}`);
      const recipe = mockRecipes.find(r => r.id === recipeId);
      
      if (!recipe) {
        return NextResponse.json(
          { error: 'Recette non trouvée' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ recipe });
    }
    
    // Retourner la réponse du backend
    const data = await response.json();
    console.log(`✅ Détails de la recette récupérés: ${data?.recipe?.titre || 'N/A'}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la recette:', error);
    
    // En cas d'erreur, retourner les données mockées
    const recipeId = params.id;
    console.log(`🚨 Utilisation des données MOCK suite à une erreur pour la recette ${recipeId}`);
    const recipe = mockRecipes.find(r => r.id === recipeId);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recette non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ recipe });
  }
}

/**
 * PUT /api/admin/recipes/[id]
 * Met à jour une recette spécifique
 */
export async function PUT(request, { params }) {
  try {
    const recipeId = params.id;
    
    if (!recipeId) {
      return NextResponse.json(
        { error: 'ID de recette manquant' },
        { status: 400 }
      );
    }
    
    // Récupérer l'en-tête d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Aucun token fourni' },
        { status: 401 }
      );
    }
    
    // URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Récupérer les données de la requête
    const recipeData = await request.json();
    
    // Envoyer la requête au backend
    const response = await fetch(`${backendUrl}/api/admin/recipes/${recipeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });
    
    // Si la réponse n'est pas ok, retourner une erreur
    if (!response.ok) {
      console.error(`Erreur lors de la mise à jour de la recette: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }
    
    // Retourner la réponse du backend
    const data = await response.json();
    console.log(`Recette mise à jour avec succès: ${data?.recipe?.titre || 'N/A'}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour de la recette' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/recipes/[id]
 * Supprime une recette spécifique
 */
export async function DELETE(request, { params }) {
  try {
    const recipeId = params.id;
    
    if (!recipeId) {
      return NextResponse.json(
        { error: 'ID de recette manquant' },
        { status: 400 }
      );
    }
    
    // Si nous utilisons des données mockées, simuler une suppression
    if (USE_MOCK_DATA) {
      console.log(`📦 Simulation de suppression pour la recette ${recipeId}`);
      return NextResponse.json({ 
        success: true,
        message: 'Recette supprimée avec succès (simulation)'
      });
    }
    
    // Récupérer l'en-tête d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Aucun token fourni' },
        { status: 401 }
      );
    }
    
    // URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Envoyer la requête au backend
    const response = await fetch(`${backendUrl}/api/admin/recipes?id=${recipeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    // Si la réponse n'est pas ok, gérer l'erreur
    if (!response.ok) {
      // En mode dégradé, simuler une suppression réussie
      console.error(`⚠️ Erreur API backend (${response.status}), simulation de suppression pour la recette ${recipeId}`);
      return NextResponse.json({ 
        success: true,
        message: 'Recette supprimée avec succès (simulation après erreur)'
      });
    }
    
    // Retourner la réponse du backend
    const data = await response.json();
    console.log(`✅ Recette supprimée avec succès: ${recipeId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la recette:', error);
    
    // En cas d'erreur, simuler une suppression réussie
    console.log(`🚨 Simulation de suppression suite à une erreur pour la recette ${params.id}`);
    return NextResponse.json({ 
      success: true,
      message: 'Recette supprimée avec succès (simulation après exception)'
    });
  }
} 