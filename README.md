# Le Monde Sucré de Linda

## Description
Application web de pâtisserie permettant aux utilisateurs de découvrir, commander et personnaliser des pâtisseries artisanales.

## État Actuel du Projet (02/02/2024)

### Fonctionnalités Implémentées ✅
- ✅ Système d'authentification complet avec tests
- ✅ Protection des routes par rôles
- ✅ Interface utilisateur avec Tailwind et Radix UI
- ✅ Tests unitaires pour les composants critiques
- ✅ Tests E2E avec Cypress (100% de réussite)
- ✅ Configuration complète de l'environnement de test

### En Cours de Développement 🚧
- 🚧 Tests d'intégration des API (80% complétés)
- 🚧 Gestion des commandes de pâtisseries
- 🚧 Interface d'administration
- 🚧 Optimisation des performances

### Métriques de Qualité 📊
- Coverage des tests : 83% (objectif : 90%)
- Performance Lighthouse : 85+
- Accessibilité : AA WCAG 2.1
- Tests E2E : 100% de réussite

### Performance API ⚡
- Login : ~37ms (objectif < 500ms)
- Register : ~12ms (objectif < 800ms)
- GET /me : ~9ms (objectif < 200ms)
- Taux de cache : > 90%

## Technologies Utilisées 🛠️

### Frontend
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Radix UI
- Framer Motion
- Jest & Testing Library
- Cypress
- MSW (Mock Service Worker)

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- Bcrypt

## Structure du Projet 📁

```
le-monde-sucre-de-linda/
├── frontend/                # Application frontend Next.js
│   ├── src/
│   │   ├── app/            # Routes et pages Next.js
│   │   ├── components/     # Composants React réutilisables
│   │   ├── hooks/         # Hooks React personnalisés
│   │   ├── providers/     # Providers React (Auth, Theme, etc.)
│   │   ├── services/      # Services (API, Auth, etc.)
│   │   ├── styles/        # Styles globaux et utilitaires
│   │   ├── types/         # Types TypeScript
│   │   └── utils/         # Fonctions utilitaires
│   └── public/            # Assets statiques
├── tests/                 # Tests
│   ├── setup/            # Configuration des tests
│   │   ├── frontend.jest.setup.js    # Configuration Jest
│   │   ├── frontend.cypress.config.js # Configuration Cypress
│   │   ├── cypress.support.ts        # Support Cypress
│   │   ├── jest.d.ts                 # Types Jest
│   │   ├── test-utils.tsx            # Utilitaires de test
│   │   └── types.ts                  # Types pour les tests
│   ├── unit/             # Tests unitaires
│   │   ├── components/   # Tests des composants
│   │   ├── hooks/        # Tests des hooks
│   │   └── services/     # Tests des services
│   ├── api/              # Tests d'API
│   └── e2e/              # Tests end-to-end Cypress
├── docs/                 # Documentation
│   ├── API.md           # Documentation API
│   ├── TESTING.md       # Guide des tests
│   ├── SECURITY.md      # Guide de sécurité
│   └── ...              # Autres docs
└── backend/              # API backend
```

## Installation 🚀

1. Cloner le repository :
```bash
git clone https://github.com/votre-username/le-monde-sucre-de-linda.git
cd le-monde-sucre-de-linda
```

2. Installer les dépendances frontend :
```bash
cd frontend
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env.local
```

## Scripts Disponibles 📜

### Frontend

```bash
# Développement
npm run dev         # Démarre le serveur de développement (port 3000)
npm run build      # Build l'application
npm run start      # Démarre l'application en production
npm run lint       # Vérifie le code avec ESLint
npm run format     # Formate le code avec Prettier

# Tests
npm run test              # Lance les tests unitaires
npm run test:watch        # Lance les tests en mode watch
npm run test:coverage     # Lance les tests avec couverture
npm run test:e2e         # Lance les tests end-to-end
npm run test:e2e:open    # Ouvre Cypress pour les tests e2e
npm run test:e2e:ci      # Lance les tests e2e en CI

# Maintenance
npm run clean      # Nettoie les dossiers build et node_modules
```

## Tests 🧪

### Configuration des Tests

Les tests sont configurés avec :
- Jest et Testing Library pour les tests unitaires
- Cypress pour les tests E2E
- MSW pour le mock des API

### Structure des Tests

1. **Tests Unitaires** (`/tests/unit/`)
   - Tests des composants React
   - Tests des hooks personnalisés
   - Tests des services

2. **Tests E2E** (`/tests/e2e/`)
   - Tests d'authentification
   - Tests de navigation
   - Tests des fonctionnalités principales

### État des Tests (02/02/2024)

#### Tests E2E (Cypress)
- ✅ Tests d'Authentification : 100%
- ✅ Tests des Rôles : 100%
- ✅ Tests de Navigation : 100%
- ✅ Tests de Cache : 100%
- ✅ Tests de Sécurité : 100%

#### Tests d'Intégration
- 🔄 Services d'Authentification : 85%
- 🔄 API Endpoints : 75%
- ✅ Gestion des Rôles : 100%

## Documentation 📚

Pour plus de détails, consultez :
- [Documentation API](docs/API.md)
- [Guide des Tests](docs/TESTING.md)
- [Guide de Sécurité](docs/SECURITY.md)
- [Guide des Performances](docs/PERFORMANCE.md)
- [Guide de Dépannage](docs/TROUBLESHOOTING.md)
- [Composants UI](docs/UI_COMPONENTS.md)

## Contribution 🤝

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## Licence 📄

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
