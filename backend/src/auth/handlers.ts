import { NextRequest, NextResponse } from 'next/server';
import { authService } from './auth.service';
import { getUserIdFromRequest } from '../middleware/auth.middleware';
import { loginSchema, registerSchema } from '../models/auth.models';

/**
 * Handler pour l'inscription d'un nouvel utilisateur
 * @param req - Requête entrante
 * @returns Réponse avec l'utilisateur créé ou erreur
 */
export async function handleRegister(req: NextRequest) {
  try {
    console.log('Tentative d\'inscription...');
    const data = await req.json();
    
    // Valider les données
    const validationResult = registerSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Enregistrer l'utilisateur
    const user = await authService.register(validationResult.data);
    console.log('Inscription réussie pour:', user.email);
    
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    
    // Erreur connue (déjà gérée dans le service)
    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Erreur inconnue
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}

/**
 * Handler pour la connexion d'un utilisateur
 * @param req - Requête entrante
 * @returns Réponse avec l'utilisateur connecté et son token ou erreur
 */
export async function handleLogin(req: NextRequest) {
  try {
    console.log('Tentative de connexion...');
    const data = await req.json();
    
    // Valider les données
    const validationResult = loginSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Authentifier l'utilisateur
    const { user, token } = await authService.login(validationResult.data);
    console.log('Connexion réussie pour:', user.email);
    
    return NextResponse.json({ user, token });
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    
    // Erreur connue (déjà gérée dans le service)
    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    // Erreur inconnue
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}

/**
 * Handler pour récupérer le profil de l'utilisateur connecté
 * @param req - Requête entrante
 * @returns Réponse avec le profil utilisateur ou erreur
 */
export async function handleGetMe(req: NextRequest) {
  try {
    console.log('Récupération du profil utilisateur...');
    
    // Récupérer l'ID de l'utilisateur depuis la requête (ajouté par le middleware)
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    // Récupérer l'utilisateur
    const user = await authService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    console.log('Profil récupéré pour:', user.email);
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil utilisateur' },
      { status: 500 }
    );
  }
}
