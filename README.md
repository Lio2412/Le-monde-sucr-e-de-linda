# Le Monde Sucré de Linda

Une plateforme de partage de recettes de pâtisserie élégante et moderne.

## 🚀 Technologies Utilisées

### Frontend
- Next.js 14
- React
- TypeScript
- TailwindCSS
- Framer Motion
- Lucide Icons
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- Bcrypt

## 🛠 Installation

### Prérequis
- Node.js (v18 ou supérieur)
- PostgreSQL
- npm ou yarn

### Configuration

1. Cloner le repository :
```bash
git clone https://github.com/votre-username/le-monde-sucre-de-linda-V2.git
cd le-monde-sucre-de-linda-V2
```

2. Installation des dépendances :

Pour le backend :
```bash
cd backend
npm install
```

Pour le frontend :
```bash
cd frontend
npm install
```

3. Configuration des variables d'environnement :

Backend (.env) :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/le-monde-sucre"
JWT_SECRET="votre-secret-jwt"
JWT_EXPIRES_IN="24h"
PORT=5000
```

Frontend (.env.local) :
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

4. Initialisation de la base de données :
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## 🚀 Démarrage

### Backend
```bash
cd backend
npm run dev
```
Le serveur démarrera sur http://localhost:5000

### Frontend
```bash
cd frontend
npm run dev
```
L'application sera disponible sur http://localhost:3000

## 👥 Comptes de Test

### Admin
- Email : admin@test.com
- Mot de passe : Admin123!

### Pâtissier
- Email : patissier@test.com
- Mot de passe : Patissier123!

### Utilisateur Standard
- Email : user@test.com
- Mot de passe : User123!

## 📱 Fonctionnalités

- Authentification complète (inscription, connexion, déconnexion)
- Gestion des rôles (Admin, Pâtissier, Utilisateur)
- Système de recettes (création, modification, suppression)
- Interface utilisateur responsive et moderne
- Animations fluides
- Gestion des erreurs
- Protection des routes

## 🔒 Sécurité

- Hachage des mots de passe avec bcrypt
- Protection CSRF
- Validation des données
- Authentification JWT
- Headers de sécurité avec Helmet

## 📝 Documentation API

La documentation complète de l'API est disponible sur :
http://localhost:5000/api-docs (quand le serveur est en cours d'exécution)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 🌟 Fonctionnalités

### Mode Cuisine
- Mode cuisine interactif avec timer intégré
- Système de notes pour les étapes
- Marquage des étapes complétées
- Mode plein écran avec Wake Lock API
- Raccourcis clavier avec boîte de dialogue
- Indicateur de progression

### Système de Partage et Images
- Partage de photos des réalisations
- Gestion des images de recettes dans `/public/images/recipes/`
- Format d'image recommandé : JPG
- Nommage des images : slug-de-la-recette.jpg (ex: tarte-citron-meringuee.jpg)
- Optimisation automatique des images avec next/image
- Galerie des réalisations de la communauté
- Nettoyage automatique du cache d'images

### Interface & Design
- Design responsive et moderne avec Tailwind CSS
- Animations fluides avec Framer Motion
- SEO optimisé avec métadonnées dynamiques
- Mode d'impression des recettes
- Système de partage social

## 📁 Structure du Projet

```
project/
├── frontend/                 # Application Next.js
│   ├── src/                 # Code source frontend
│   │   ├── app/            # Pages et composants
│   │   ├── components/     # Composants réutilisables
│   │   ├── lib/           # Utilitaires et hooks
│   │   └── types/         # Types TypeScript
│   ├── public/             # Fichiers statiques
│   └── README.md          # Documentation frontend
│
├── backend/                 # Serveur Node.js
│   ├── src/                # Code source backend
│   │   ├── routes/        # Routes de l'API
│   │   ├── types/         # Types TypeScript
│   │   └── server.ts      # Point d'entrée
│   └── README.md          # Documentation backend
│
└── README.md               # Documentation générale
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests E2E
cd frontend && npm run cypress
```

## 📝 Conventions de Code

- ESLint et Prettier pour la qualité du code
- TypeScript strict
- Tests unitaires pour les composants principaux
- Documentation des fonctions et composants

## 📄 Gestion des Images et Slugs

### Structure des Images
```