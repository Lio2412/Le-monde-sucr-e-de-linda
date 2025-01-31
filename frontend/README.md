# Frontend - Le Monde Sucré de Linda

## Structure du Projet

```
frontend/
├── src/
│   ├── app/              # Pages et routes Next.js
│   ├── components/       # Composants React réutilisables
│   ├── hooks/           # Hooks React personnalisés
│   ├── services/        # Services API et utilitaires
│   ├── styles/          # Styles globaux et variables
│   └── types/           # Types TypeScript
├── public/              # Assets statiques
├── cypress/             # Tests E2E
└── __tests__/          # Tests unitaires
```

## Configuration

1. Installation des dépendances :
```bash
npm install
```

2. Configuration des variables d'environnement :
```bash
cp .env.example .env.local
```

## Scripts Disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Compile le projet pour la production
- `npm start` : Lance le serveur de production
- `npm test` : Lance les tests unitaires
- `npm run cypress` : Lance les tests E2E
- `npm run lint` : Vérifie le style du code
- `npm run format` : Formate le code avec Prettier

## Tests

### Tests Unitaires
Les tests unitaires utilisent Jest et React Testing Library.
```bash
npm test
```

### Tests E2E
Les tests E2E utilisent Cypress.
```bash
npm run cypress
```

## Composants UI

Le projet utilise :
- TailwindCSS pour le styling
- Shadcn/ui pour les composants de base
- Framer Motion pour les animations

## Mode Cuisine

Le mode cuisine est une fonctionnalité spéciale qui inclut :
- Timer intégré
- Système de notes
- Mode plein écran
- Progression des étapes

## Conventions de Code

- TypeScript strict
- ESLint pour la qualité du code
- Prettier pour le formatage
- Tests unitaires pour les composants principaux

## Performance

- Optimisation des images avec next/image
- Lazy loading des composants
- Mise en cache avec SWR
- Optimisation SEO avec les métadonnées Next.js 