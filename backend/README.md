# Backend - Le Monde Sucré de Linda

## Description
API backend construite avec Node.js, Express, TypeScript et Prisma. Connectée à une base de données PostgreSQL.

## Installation
1. Installer les dépendances :
   npm install
2. Configurer les variables d'environnement :
   Créez un fichier .env avec les variables nécessaires (voir .env.example si disponible).
3. Démarrer le serveur de développement :
   node server.js

## Structure du Projet
- prisma/      # Schémas et migrations pour PostgreSQL
- src/         # Code source de l'API
- server.js    # Point d'entrée du serveur
- tsconfig.json  # Configuration TypeScript

## Tests et CI/CD
Les tests sont exécutés via des pipelines CI/CD. Consultez la documentation du projet pour plus de détails.

## Contribution
Les contributions sont les bienvenues. Merci de suivre les guidelines du projet en créant une branche de fonctionnalité et en soumettant une pull request.

## Licence
MIT 