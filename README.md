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
│   ├── public/              # Fichiers statiques
│   ├── cypress/             # Tests E2E
│   └── README.md           # Documentation frontend
│
├── backend/                 # Serveur Node.js
│   ├── src/                # Code source backend
│   ├── prisma/             # Configuration Prisma
│   ├── scripts/            # Scripts utilitaires
│   ├── config/             # Configurations
│   └── README.md          # Documentation backend
│
└── docs/                   # Documentation générale
```

## 🚀 Démarrage Rapide

1. Cloner le projet :
```bash
git clone https://github.com/votre-username/le-monde-sucre-de-linda.git
cd le-monde-sucre-de-linda
```

2. Installation des dépendances :
```bash
npm run setup
```

3. Configuration :
- Copier `.env.example` vers `.env` dans le dossier backend
- Copier `.env.example` vers `.env.local` dans le dossier frontend
- Configurer les variables d'environnement

4. Lancer le projet :
```bash
npm run dev
```

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

## 📝 Gestion des Images

### Structure des Images
```
frontend/
└── public/
    └── images/
        ├── recipes/           # Images des recettes
        ├── maintenance.png    # Image de maintenance
        ├── 404-cake.png      # Image 404
        └── icons/            # Icônes du site
```

### Conventions de Nommage
- Images de recettes : `slug-de-la-recette.jpg`
- Format recommandé : JPG
- Résolution recommandée : 1200x800 pixels
- Taille maximale : 500KB

### Ajout d'une Nouvelle Image
1. Placer l'image dans `frontend/public/images/recipes/`
2. Nommer l'image selon le slug de la recette
3. Mettre à jour le mock data avec le chemin correct
4. Vérifier l'affichage sur la page de la recette