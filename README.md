# Le Monde Sucré de Linda

Un blog de pâtisserie élégant et interactif, développé avec Next.js et Node.js, mettant en valeur des recettes gourmandes dans un design minimaliste et raffiné.

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

## 🚀 Démarrage Rapide

1. Cloner le projet :
```bash
git clone https://github.com/votre-username/le-monde-sucre-de-linda.git
cd le-monde-sucre-de-linda
```

2. Installation des dépendances :
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. Configuration :
- Copier `.env.example` vers `.env` dans le dossier backend
- Copier `.env.example` vers `.env.local` dans le dossier frontend
- Configurer les variables d'environnement

4. Lancer le projet :
```bash
npm run dev
```

Le frontend sera accessible sur http://localhost:3000
L'API backend sera accessible sur http://localhost:5000

## 🛠 Technologies Utilisées

### Frontend
- Next.js 14
- TypeScript
- TailwindCSS
- Shadcn/ui
- Framer Motion
- SWR

### Backend
- Node.js avec Express
- TypeScript
- PostgreSQL avec Prisma
- Jest pour les tests

## 📚 Documentation

- [Documentation Frontend](frontend/README.md)
- [Documentation Backend](backend/README.md)
- [Documentation Mode Cuisine](docs/mode-cuisine.md)

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

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📄 Gestion des Images et Slugs

### Structure des Images
```