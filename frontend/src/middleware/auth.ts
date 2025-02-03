import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Liste des routes protégées qui nécessitent une authentification
  const protectedRoutes = [
    '/mes-recettes',
    '/creer-recette',
    '/profil',
    '/favoris'
  ];

  // Liste des routes publiques réservées aux utilisateurs non authentifiés
  const publicOnlyRoutes = [
    '/login',
    '/register'
  ];

  // Vérifier si l'utilisateur tente d'accéder à une route protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );

  // Vérifier si l'utilisateur tente d'accéder à une route publique réservée
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );

  // Si l'utilisateur n'est pas authentifié et tente d'accéder à une route protégée
  if (!token && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si l'utilisateur est authentifié et tente d'accéder à une route publique réservée
  if (token && isPublicOnlyRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Pour toutes les autres routes, continuer normalement
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
    '/register'
  ]
};
