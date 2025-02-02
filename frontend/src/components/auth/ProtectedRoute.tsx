import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { user, loading, hasRole, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/connexion');
      return;
    }

    if (!loading && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        router.replace('/acces-refuse');
      }
    }
  }, [loading, isAuthenticated, router, requiredRoles, hasRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
} 