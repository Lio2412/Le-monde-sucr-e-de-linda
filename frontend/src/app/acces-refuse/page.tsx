import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Accès Refusé</h1>
          <p className="text-gray-600 mb-8">
            Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-block w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Retour à l'accueil
            </Link>
            <Link
              href="/connexion"
              className="inline-block w-full px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Se connecter avec un autre compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 