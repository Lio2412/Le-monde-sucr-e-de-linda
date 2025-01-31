# Backend - Le Monde Sucré de Linda

## Structure du Projet

```
backend/
├── src/                    # Code source principal
│   ├── routes/            # Routes de l'API
│   ├── models/            # Modèles de données
│   ├── middlewares/       # Middlewares Express
│   ├── lib/              # Utilitaires et configurations
│   └── __tests__/        # Tests unitaires
├── prisma/                # Configuration et schémas Prisma
├── scripts/               # Scripts utilitaires
└── config/               # Fichiers de configuration
```

## Configuration

1. Installation des dépendances :
```bash
npm install
```

2. Configuration des variables d'environnement :
```bash
cp .env.example .env
```

3. Configuration de la base de données :
```bash
npx prisma generate
npx prisma migrate dev
```

## Scripts Disponibles

- `npm run dev` : Lance le serveur en mode développement
- `npm run build` : Compile le projet
- `npm start` : Lance le serveur en production
- `npm test` : Lance les tests unitaires
- `npm run lint` : Vérifie le style du code
- `npm run format` : Formate le code avec Prettier

## Tests

Les tests sont organisés dans des dossiers `__tests__` à côté des fichiers qu'ils testent.
Pour lancer les tests :

```bash
npm test
```

## Conventions de Code

- Utilisation de TypeScript strict
- ESLint pour la qualité du code
- Prettier pour le formatage
- Tests unitaires avec Jest

## API Documentation

L'API suit les principes REST et utilise JSON pour les requêtes/réponses.

### Points d'entrée principaux :

- `GET /api/recipes` : Liste des recettes
- `POST /api/recipes` : Création d'une recette
- `GET /api/recipes/:id` : Détails d'une recette
- `PUT /api/recipes/:id` : Mise à jour d'une recette
- `DELETE /api/recipes/:id` : Suppression d'une recette

## Sécurité

- Validation des entrées avec express-validator
- Protection CORS configurée
- Rate limiting sur les routes sensibles
- Sanitization des entrées utilisateur 