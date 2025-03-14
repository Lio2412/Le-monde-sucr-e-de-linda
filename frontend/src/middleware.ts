import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';
import { UserRole } from '@/types/auth';

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/api/recettes',
  '/api/categories',
  '/api/users',
  '/dashboard',
  '/admin',
];

// Routes qui nécessitent un rôle d'administrateur
const adminRoutes = [
  '/admin',
  '/api/users',
];

// Routes publiques qui sont des exceptions aux routes protégées
const publicExceptions = [
  '/api/admin/init',
  '/admin/init',
  '/api/admin/login',
  '/api/admin/logout',
  '/api/admin/validate-session',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware exécuté pour:', pathname);
  
  // Vérifier si la route est une exception publique
  const isPublicException = publicExceptions.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // Si la route est une exception publique, autoriser l'accès
  if (isPublicException) {
    console.log('Route exception publique, accès autorisé');
    return NextResponse.next();
  }
  
  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Vérifier si la route nécessite un rôle d'administrateur
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Si la route n'est pas protégée, continuer
  if (!isProtectedRoute) {
    console.log('Route non protégée, accès autorisé');
    return NextResponse.next();
  }
  
  // Récupérer le token d'authentification
  // Essayer d'abord depuis les headers d'autorisation
  let token = request.headers.get('authorization')?.split(' ')[1] || '';
  
  // Si pas de token dans les headers, essayer depuis les cookies
  if (!token) {
    const authCookie = request.cookies.get('auth_token');
    token = authCookie?.value || '';
  }
  
  console.log('Token trouvé:', token ? 'Oui' : 'Non');
  
  // Vérifier le token
  try {
    const verifiedToken = await verifyJwtToken(token);
    console.log('Résultat de la vérification du token:', verifiedToken ? 'Valide' : 'Invalide');
    
    // Si le token n'est pas valide, rediriger vers la page de connexion
    if (!verifiedToken) {
      console.log('Token invalide, redirection vers la page de connexion');
      
      // Si c'est une route API, renvoyer une erreur 401
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 401 }
        );
      }
      
      // Sinon, rediriger vers la page de connexion
      return NextResponse.redirect(new URL('/connexion', request.url));
    }
    
    // Vérifier si l'utilisateur a le rôle d'administrateur pour les routes admin
    if (isAdminRoute && verifiedToken.role !== UserRole.ADMIN) {
      console.log('Accès refusé à une route admin pour un utilisateur non admin');
      
      // Si c'est une route API, renvoyer une erreur 403
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Accès refusé' },
          { status: 403 }
        );
      }
      
      // Sinon, rediriger vers la page d'accueil
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Si tout est en ordre, continuer
    return NextResponse.next();
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    
    // En cas d'erreur, rediriger vers la page de connexion
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Erreur d\'authentification' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/connexion', request.url));
  }
}

// Configurer les routes sur lesquelles le middleware doit s'exécuter
export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
  ],
};