import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Vérifier directement le cookie auth_token au lieu de getToken
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;
  
  console.log('Middleware exécuté pour:', pathname);
  console.log('Token trouvé:', token ? 'Oui' : 'Non');

  // Liste des routes protégées qui nécessitent une authentification
  const protectedRoutes = [
    '/mes-recettes',
    '/creer-recette',
    '/profil',
    '/favoris',
    '/admin', // Ajout de la route admin
    '/dashboard'
  ];

  // Liste des routes publiques réservées aux utilisateurs non authentifiés
  const publicOnlyRoutes = [
    '/login',
    '/register',
    '/connexion'
  ];

  // Liste des routes réservées aux administrateurs
  const adminRoutes = [
    '/admin'
  ];

  // Vérifier si l'utilisateur tente d'accéder à une route protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );

  // Vérifier si l'utilisateur tente d'accéder à une route admin
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );

  // Vérifier si l'utilisateur tente d'accéder à une route publique réservée
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );

  // Vérifier si le token est valide (simple vérification de présence)
  const isValidToken = !!token;
  console.log('Résultat de la vérification du token:', isValidToken ? 'Valide' : 'Invalide');

  // Vérifier si l'utilisateur est admin (nécessiterait une vérification plus complexe)
  // Pour le moment, on utilise simplement la présence d'un token mock-token-admin
  const isAdmin = token === 'mock-token-admin';

  // Si l'utilisateur n'est pas authentifié et tente d'accéder à une route protégée
  if (!isValidToken && isProtectedRoute) {
    console.log('Token invalide, redirection vers la page de connexion');
    const redirectUrl = new URL('/connexion', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si l'utilisateur est authentifié mais n'est pas admin et tente d'accéder à une route admin
  if (isValidToken && isAdminRoute && !isAdmin) {
    console.log('Utilisateur non admin, redirection vers accès refusé');
    return NextResponse.redirect(new URL('/acces-refuse', request.url));
  }

  // Si l'utilisateur est authentifié et tente d'accéder à une route publique réservée
  if (isValidToken && isPublicOnlyRoute) {
    console.log('Utilisateur déjà connecté, redirection vers l\'accueil');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Pour toutes les autres routes, continuer normalement
  console.log('Accès autorisé');
  return NextResponse.next();
}

// Configuration des chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    '/mes-recettes/:path*',
    '/creer-recette/:path*',
    '/profil/:path*',
    '/favoris/:path*',
    '/login',
    '/register',
    '/connexion',
    '/admin/:path*',
    '/admin',
    '/dashboard'
  ]
};
