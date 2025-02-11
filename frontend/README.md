# Le Monde Sucré de Linda

## Description
Application web de pâtisserie permettant aux utilisateurs de découvrir, commander et personnaliser des pâtisseries artisanales.

## Fonctionnalités Actuelles
- Système d'authentification complet
- Protection des routes par rôles
- Interface moderne (Next.js, React, TailwindCSS, Radix UI)
- Commande de pâtisseries (en cours)
- Tests unitaires et E2E pour les fonctionnalités critiques

## Structure du Projet
├── frontend/      # Application Next.js (React, TypeScript, TailwindCSS)
└── backend/       # API Node.js (Express, TypeScript, Prisma)

## Installation
1. Cloner le repository:
   git clone https://github.com/votre-username/le-monde-sucre-de-linda.git
   cd le-monde-sucre-de-linda

2. Installer les dépendances:
   - Frontend: cd frontend && npm install
   - Backend: cd backend && npm install

3. Configurer les variables d'environnement:
   - Frontend: cp .env.example .env.local
   - Backend: créer un fichier .env avec les variables nécessaires

## Scripts Disponibles

### Frontend
npm run dev      # Démarrer le serveur de développement
npm run build    # Build de production
npm run start    # Lancement en production
npm run lint     # Vérification ESLint
npm run format   # Formatage avec Prettier

### Backend
node server.js   # Démarrer le serveur en développement

## Tests
- Frontend: npm run test (unitaires et E2E)
- Backend: Tests intégrés via CI/CD

## Documentation Complémentaire
Pour plus d'informations, consultez le dossier /docs (API, tests, sécurité, etc.).

## Contribution
Forkez le projet, créez une branche de fonctionnalité, commitez vos changements et ouvrez une pull request.

## Licence
MIT 