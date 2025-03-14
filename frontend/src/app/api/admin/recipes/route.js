import { NextResponse } from "next/server";
import { getMockRecipes } from "@/data/mock-recipes";

// Variable d'environnement pour activer/désactiver les données mock
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || false;

/**
 * GET /api/admin/recipes
 * Récupère la liste des recettes
 */
export async function GET(request) {
  try {
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'date_creation';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const categoryId = searchParams.get('categoryId') || '';
    
    // Si nous utilisons des données mockées, retourner les données mockées
    if (USE_MOCK_DATA) {
      console.log('📦 Utilisation des données MOCK pour les recettes');
      const mockData = getMockRecipes({
        page: parseInt(page), 
        pageSize: parseInt(pageSize), 
        search, 
        sortBy, 
        sortDirection, 
        categoryId
      });
      return NextResponse.json(mockData);
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
    
    // Construire l'URL avec les paramètres
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (pageSize) queryParams.append('pageSize', pageSize);
    if (search) queryParams.append('search', search);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortDirection) queryParams.append('sortDirection', sortDirection);
    if (categoryId) queryParams.append('categoryId', categoryId);
    
    const url = `${backendUrl}/api/admin/recipes?${queryParams.toString()}`;
    
    // Envoyer la requête au backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    // Si la réponse n'est pas ok, retourner les données mockées en mode dégradé
    if (!response.ok) {
      console.error(`⚠️ Erreur API backend (${response.status}), utilisation des données MOCK pour les recettes`);
      const mockData = getMockRecipes({
        page: parseInt(page), 
        pageSize: parseInt(pageSize), 
        search, 
        sortBy, 
        sortDirection, 
        categoryId
      });
      return NextResponse.json(mockData);
    }
    
    // Retourner la réponse du backend
    const data = await response.json();
    console.log(`✅ Recettes récupérées: ${data?.recipes?.length || 0}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des recettes:', error);
    
    // En cas d'erreur, retourner les données mockées
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'date_creation';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const categoryId = searchParams.get('categoryId') || '';
    
    console.log('🚨 Utilisation des données MOCK suite à une erreur');
    const mockData = getMockRecipes({
      page: parseInt(page), 
      pageSize: parseInt(pageSize), 
      search, 
      sortBy, 
      sortDirection, 
      categoryId
    });
    return NextResponse.json(mockData);
  }
}

/**
 * POST /api/admin/recipes
 * Crée une nouvelle recette
 */
export async function POST(request) {
  try {
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
    const response = await fetch(`${backendUrl}/api/admin/recipes`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });
    
    // Si la réponse n'est pas ok, retourner une erreur
    if (!response.ok) {
      console.error(`Erreur lors de la création de la recette: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }
    
    // Retourner la réponse du backend
    const data = await response.json();
    console.log(`Recette créée avec succès: ${data?.recipe?.titre || 'N/A'}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la création de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la recette' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/recipes
 * Met à jour une recette existante
 */
export async function PUT(request) {
  try {
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
    const response = await fetch(`${backendUrl}/api/admin/recipes`, {
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
 * DELETE /api/admin/recipes/:id
 * Supprime une recette
 */
export async function DELETE(request) {
  try {
    // Récupérer l'id de la recette depuis l'URL
    const url = new URL(request.url);
    const paths = url.pathname.split('/');
    const recipeId = paths[paths.length - 1];
    
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
    
    // Envoyer la requête au backend
    const response = await fetch(`${backendUrl}/api/admin/recipes?id=${recipeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    // Si la réponse n'est pas ok, retourner une erreur
    if (!response.ok) {
      console.error(`Erreur lors de la suppression de la recette: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }
    
    // Retourner la réponse du backend
    const data = await response.json();
    console.log(`Recette supprimée avec succès: ${recipeId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la suppression de la recette:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression de la recette' },
      { status: 500 }
    );
  }
} 