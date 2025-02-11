import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from './lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  // Vérifier si la route nécessite une authentification
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      // Vérifier et décoder le token
      const decoded = verify(token, JWT_SECRET) as any;
      
      // Vérifier si l'utilisateur a le rôle admin
      const userRoles = await prisma.userRole.findMany({
        where: {
          userId: decoded.id
        },
        include: {
          role: true
        }
      });

      const isAdmin = userRoles.some(ur => ur.role.nom === 'ADMIN');

      if (!isAdmin) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } catch (error) {
      // Token invalide ou expiré
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Redirection des utilisateurs connectés
  if (request.nextUrl.pathname === '/auth/login') {
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      try {
        const decoded = verify(token, JWT_SECRET) as any;
        const userRoles = await prisma.userRole.findMany({
          where: {
            userId: decoded.id
          },
          include: {
            role: true
          }
        });

        const isAdmin = userRoles.some(ur => ur.role.nom === 'ADMIN');
        if (isAdmin) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
      } catch {
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/login',
  ],
};