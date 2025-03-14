# Le Monde Sucré de Linda

Application de recettes de pâtisserie développée avec Next.js, Prisma et SQLite.

## 🚀 Fonctionnalités

- Authentification sécurisée (inscription, connexion, gestion de profil)
- Gestion des recettes de pâtisserie
- Catégorisation et tags pour les recettes
- Interface utilisateur moderne et responsive
- Panneau d'administration pour les utilisateurs privilégiés

## 🛠️ Technologies utilisées

- **Frontend** : Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend** : Node.js, Prisma, SQLite (développement)
- **Authentification** : JWT (JSON Web Tokens)
- **Styles** : Tailwind CSS, Shadcn UI, Radix UI

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- npm (v8 ou supérieur)

## 🔧 Installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/votre-utilisateur/le-monde-sucre-de-linda.git
cd le-monde-sucre-de-linda
```

2. **Installer les dépendances**

```bash
npm run install:all
```

3. **Générer les types Prisma**

```bash
npm run prisma:generate
```

4. **Exécuter les migrations Prisma**

```bash
npm run prisma:migrate
```

## 🚀 Démarrage

### Développement

Pour lancer l'application en mode développement :

```bash
npm run dev
```

Cette commande démarre simultanément :
- Le serveur backend sur http://localhost:5000
- Le serveur frontend sur http://localhost:3000

### Production

Pour construire l'application pour la production :

```bash
npm run build
```

Pour démarrer l'application en mode production :

```bash
npm run start
```

## 📁 Structure du projet

```
le-monde-sucre-de-linda/
├── backend/                # API et logique métier
│   ├── prisma/             # Schéma et migrations Prisma
│   ├── src/                # Code source du backend
│   │   ├── app/            # Routes API
│   │   ├── auth/           # Authentification
│   │   ├── middleware/     # Middlewares
│   │   ├── models/         # Modèles de données
│   │   └── utils/          # Utilitaires
│   └── package.json        # Dépendances du backend
│
├── frontend/               # Interface utilisateur
│   ├── public/             # Fichiers statiques
│   ├── src/                # Code source du frontend
│   │   ├── app/            # Pages et routes
│   │   ├── components/     # Composants React
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── lib/            # Bibliothèques et utilitaires
│   │   └── providers/      # Providers React
│   └── package.json        # Dépendances du frontend
│
└── package.json            # Scripts globaux
```

## 🔐 Utilisateur administrateur par défaut

Un utilisateur administrateur est créé automatiquement lors de la première exécution :

- **Email** : admin@lemondesucre.fr
- **Mot de passe** : Admin123!

## 📝 Licence

Ce projet est sous licence ISC.

## 👥 Auteurs

- Linda - Créatrice du concept
- [Votre nom] - Développeur 