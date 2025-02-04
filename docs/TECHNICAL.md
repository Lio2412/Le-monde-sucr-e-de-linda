# Guide Technique

## Stack Technique

### Frontend
- Next.js 14.0.4
- React 18.2.0
- TypeScript 5.3.3
- TailwindCSS 3.4.1
- Radix UI (dernières versions)
- Jest 29.7.0
- Cypress 13.6.3

### Backend
- Node.js 18.x
- Express 4.18.2
- TypeScript 5.3.3
- Prisma 5.8.1
- PostgreSQL 14+

## Architecture

### Frontend
```
frontend/
├── src/
│   ├── app/              # Pages et routes Next.js
│   │   ├── layout.tsx    # Layout principal
│   │   ├── page.tsx      # Page d'accueil
│   │   └── auth/         # Routes d'authentification
│   ├── components/       # Composants React
│   │   ├── ui/          # Composants de base
│   │   └── auth/        # Composants d'authentification
│   ├── lib/             # Utilitaires et configurations
│   └── types/           # Types TypeScript
├── public/              # Assets statiques
└── tests/              # Tests (unitaires, E2E)
```

### Backend
```
backend/
├── src/
│   ├── routes/          # Routes API
│   │   └── auth/        # Routes d'authentification
│   ├── controllers/     # Contrôleurs
│   ├── services/        # Logique métier
│   └── types/          # Types TypeScript
├── prisma/             # Schéma et migrations
└── tests/             # Tests
```

## Configuration

### Variables d'Environnement

#### Frontend (.env.local)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Environment
NEXT_PUBLIC_ENV=development
```

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Server
PORT=3001
NODE_ENV=development

# Auth
JWT_SECRET=your-secret-key

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Scripts Disponibles

### Frontend
```bash
npm install      # Installation des dépendances
npm run dev      # Développement sur port 3000
npm run build    # Build de production
npm start        # Lancement en production
npm run test     # Tests unitaires
npm run cypress  # Tests E2E
```

### Backend
```bash
npm install      # Installation des dépendances
npm run dev      # Développement sur port 3001
npm run build    # Build de production
npm start        # Lancement en production
npm test         # Tests
```

## Tests

### Frontend
- Tests unitaires avec Jest et Testing Library
- Tests E2E avec Cypress
- Coverage actuel : 83%

### Backend
- Tests unitaires avec Jest
- Tests d'API avec Supertest
- Tests d'intégration en cours d'implémentation 