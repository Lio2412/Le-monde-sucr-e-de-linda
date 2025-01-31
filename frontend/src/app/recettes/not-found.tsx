import Link from 'next/link';

export default function RecetteNotFound() {
  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-4">
          Oups ! Cette page s'est évaporée comme un soufflé raté
        </h1>
        
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
          Mais ne vous inquiétez pas, nous avons d'autres délicieuses recettes pour vous !
        </p>

        <div className="space-x-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
          >
            Retour à l'accueil
          </Link>
          
          <Link
            href="/recettes"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-pink-600 bg-white hover:bg-pink-50"
          >
            Voir toutes les recettes
          </Link>
        </div>
      </div>
    </div>
  );
} 