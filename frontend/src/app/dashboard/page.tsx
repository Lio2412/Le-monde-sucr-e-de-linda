'use client';

export default function Dashboard() {
  // Données utilisateur statiques pour démonstration
  const user = {
    nom: 'Durand',
    prenom: 'Linda',
    pseudo: 'linda',
    email: 'linda@example.com',
    roles: [
      { role: { nom: 'USER', description: 'Utilisateur standard' } }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenue, {user.prenom} !</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Section Profil */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Votre Profil</h3>
            <p className="text-gray-600">Nom: {user.nom}</p>
            <p className="text-gray-600">Prénom: {user.prenom}</p>
            <p className="text-gray-600">Pseudo: {user.pseudo}</p>
            <p className="text-gray-600">Email: {user.email}</p>
          </div>

          {/* Section Rôles */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Vos Rôles</h3>
            <div className="space-y-1">
              {user.roles.map((role, index) => (
                <div key={index} className="text-sm text-gray-600">
                  <span className="font-medium">{role.role.nom}</span>
                  <p className="text-xs text-gray-500">{role.role.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section Actions Rapides */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Actions Rapides</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-sm text-white bg-pink-400 rounded hover:bg-pink-500 transition-colors">
                Modifier mon profil
              </button>
              <button className="w-full px-4 py-2 text-sm text-pink-400 bg-white border border-pink-400 rounded hover:bg-gray-50 transition-colors">
                Voir mes recettes favorites
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}