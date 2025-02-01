# Le Monde Sucré de Linda

Un blog de pâtisserie élégant et interactif, développé avec Next.js et Node.js, mettant en valeur des recettes gourmandes dans un design minimaliste et raffiné.

## ⚠️ État Actuel (2024-02-01)
- Tests d'authentification : ❌ Problèmes avec la gestion du rôle USER
- Tests de performance : En cours d'optimisation
- Performance API : 
  - Login : ~37ms (objectif < 500ms)
  - Register : ~12ms (objectif < 800ms)
  - GET /me : ~9ms (objectif < 200ms)
- Taux de cache : > 90% pour les endpoints fréquents

## 🧪 Tests
- Couverture de code :
  - Global : 92.53%
  - Branches : 75% (objectif 80%)
  - Fonctions : 80%
  - Lignes : 92.53%

### Points d'Attention
1. Tests d'intégration à stabiliser
2. Gestion du rôle USER à optimiser
3. Couverture des branches à améliorer

## 📚 Documentation

Toute la documentation du projet est disponible dans le [dossier docs](./docs/README.md).

Documentation détaillée :
- [Documentation API](./docs/API.md)
- [Guide des tests](./docs/TESTING.md)
- [Performance](./docs/PERFORMANCE.md)
- [Sécurité](./docs/SECURITY.md)
- [Scénarios de Test](./docs/TEST_SCENARIOS.md)
- [Dépannage](./docs/TROUBLESHOOTING.md)
- [TODO List](./docs/TODO.md)
- [Changelog](./docs/CHANGELOG.md)
- [Composants UI](./docs/UI_COMPONENTS.md)

## 🚀 Démarrage Rapide

1. Installation :
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

2. Configuration :
- Copier `.env.example` vers `.env` dans le dossier backend
- Copier `.env.example` vers `.env.local` dans le dossier frontend
- Configurer les variables d'environnement selon votre environnement

3. Lancer le projet :
```bash
# Backend (http://localhost:5000)
cd backend && npm run dev

# Frontend (http://localhost:3000)
cd frontend && npm run dev
```

## 🛠 Technologies Utilisées

### Frontend
- Next.js 14
- TypeScript
- TailwindCSS
- Shadcn/ui
- Framer Motion

### Backend
- Node.js avec Express
- TypeScript
- PostgreSQL avec Prisma
- Jest pour les tests

## 🔒 Sécurité et Performance

### Sécurité
- Authentification JWT complète
- Gestion des rôles (ADMIN, PATISSIER, USER)
- Protection CSRF
- Validation des données avec Zod

### Performance
- Temps de réponse API optimisés
  - Login : ~37ms (max 500ms)
  - Register : ~12ms (max 800ms)
  - GET /me : ~9ms (max 200ms)
- Cache efficace (>90% hit rate)
- Compression gzip activée
- Tests de charge validés

## 🐛 Problèmes Connus
- Couverture de code insuffisante
- Tests des composants UI manquants
- Optimisation des tests d'inscription nécessaire

## 📈 Améliorations Récentes
- Tests de performance optimisés
- Gestion des erreurs améliorée
- Configuration du rate limiting
- Tests de résilience validés
- Optimisation de la gestion du rôle USER : Mise à jour du middleware d'authentification pour charger l'utilisateur complet avec ses rôles via Prisma, et ajustement des tests d'intégration pour garantir l'unicité des emails.

## 📝 Prochaines Étapes
1. Augmenter la couverture de code (objectif : 70%)
2. Implémenter les tests des composants UI.
3. Optimiser les tests d'inscription
4. Améliorer la documentation des tests

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

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
```

# 🍰 Le Monde Sucré de Linda

Une application web moderne pour découvrir et partager des recettes de pâtisserie.

## ✨ Fonctionnalités

- 🔍 Recherche intelligente de recettes
- 📱 Interface responsive et accessible
- 💖 Système de favoris
- 🔄 Suggestions en temps réel
- 📊 Filtres avancés
- 🌟 Historique des recherches

## 🚀 Installation

```bash
# Cloner le dépôt
git clone https://github.com/Lio2412/Le-monde-sucr-e-de-linda.git
cd le-monde-sucre-de-linda

# Installer les dépendances du frontend
cd frontend
npm install

# Installer les dépendances du backend
cd ../backend
npm install
```

## 🛠️ Configuration

### Frontend
```bash
# Créer un fichier .env.local
cd frontend
cp .env.example .env.local

# Démarrer le serveur de développement
npm run dev
```

### Backend
```bash
# Créer un fichier .env
cd backend
cp .env.example .env

# Configurer la base de données
npx prisma migrate dev

# Démarrer le serveur
npm run dev
```

## 🧪 Tests

### Tests E2E (Cypress)
```bash
# Dans le dossier racine
npm run test:e2e
```

✅ Tests d'Accessibilité (5/5)
- Attributs ARIA
- Navigation au clavier
- Gestion du focus
- Contraste des couleurs

✅ Tests d'Interactions (5/5)
- Recherche et filtres
- Suggestions
- Interactions avec les recettes
- Navigation
- Recherches récentes

### Tests Unitaires
```bash
npm run test
```

## 📚 Documentation

- [API](docs/API.md)
- [Tests](docs/TESTING.md)
- [UI Components](docs/UI_COMPONENTS.md)
- [Performance](docs/PERFORMANCE.md)
- [Sécurité](docs/SECURITY.md)

## 🌟 Fonctionnalités à Venir

- [ ] Authentification des utilisateurs
- [ ] Création de recettes
- [ ] Partage sur les réseaux sociaux
- [ ] Mode hors ligne
- [ ] Notifications

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- Linda - Créatrice & Designer
- [Contributeurs](https://github.com/Lio2412/Le-monde-sucr-e-de-linda/graphs/contributors)

## 📞 Support

Pour toute question ou suggestion :
- [Ouvrir une issue](https://github.com/Lio2412/Le-monde-sucr-e-de-linda/issues)
- Email : contact@lemondesucre.fr