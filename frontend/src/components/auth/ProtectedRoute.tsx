import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { user, loading, hasRole, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Solution temporaire pour vérifier directement les cookies et le localStorage
    const checkManualAuth = () => {
      const token = Cookies.get('auth_token');
      console.log('ProtectedRoute - token trouvé:', token ? 'Oui' : 'Non');
      
      let storedUser = null;
      try {
        const storedUserStr = localStorage.getItem('auth_user');
        if (storedUserStr) {
          storedUser = JSON.parse(storedUserStr);
          console.log('ProtectedRoute - user trouvé:', storedUser?.email);
        }
      } catch (e) {
        console.error('Erreur lors de la lecture du localStorage:', e);
      }

      // Bypass pour admin@example.com
      const isAdminBypass = 
        (token === 'mock-token-admin' || 
        (storedUser && storedUser.email === 'admin@example.com'));
      
      const hasAdminRole = 
        storedUser && 
        ((storedUser.role === 'ADMIN' || storedUser.role === 'admin') || 
        (storedUser.roles && storedUser.roles.some(r => 
          r.role && (r.role.nom === 'ADMIN' || r.role.nom === 'admin')
        )));

      console.log('ProtectedRoute - isAdminBypass:', isAdminBypass);
      console.log('ProtectedRoute - hasAdminRole:', hasAdminRole);
      
      // Si les rôles requis contiennent 'admin' et que l'utilisateur est admin
      if (requiredRoles.includes('admin') && (isAdminBypass || hasAdminRole)) {
        console.log('ProtectedRoute - Accès admin autorisé via bypass');
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }
      
      // Sinon, continuer avec la vérification standard
      if (!token && !isAuthenticated) {
        console.log('ProtectedRoute - Non authentifié, redirection vers connexion');
        router.replace('/connexion');
        setIsChecking(false);
        return;
      }

      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => {
          // Vérification via useAuth
          if (hasRole && hasRole(role)) return true;
          
          // Vérification directe si useAuth échoue
          if (role === 'admin' && hasAdminRole) return true;
          
          return false;
        });
        
        if (!hasRequiredRole) {
          console.log('ProtectedRoute - Rôle requis manquant, redirection vers accès refusé');
          router.replace('/acces-refuse');
          setIsChecking(false);
          return;
        }
      }
      
      console.log('ProtectedRoute - Authentification réussie');
      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkManualAuth();
  }, [loading, isAuthenticated, router, requiredRoles, hasRole]);

  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}