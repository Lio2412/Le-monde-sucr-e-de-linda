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

### Interface & Design
- Design responsive et moderne avec Tailwind CSS
- Animations fluides avec Framer Motion
- SEO optimisé avec métadonnées dynamiques
- Optimisation des images avec next/image
- Mode d'impression des recettes
- Système de partage social

## 🚧 État d'Avancement

### ✅ Fonctionnalités Complétées
- Configuration complète de Next.js avec TypeScript
- Mise en place de TailwindCSS et Framer Motion
- Composants UI réutilisables avec Shadcn/ui
- Optimisation des images et gestion du SEO
- Mode cuisine avec timer et notes
- Tests unitaires des composants principaux

### 🔄 En Développement
- Système d'authentification
- Gestion des favoris
- Système de commentaires
- Recherche et filtrage des recettes
- Amélioration de l'accessibilité
- Support des raccourcis clavier pour tablettes

## 🛠 Technologies

### Frontend
- Next.js 14
- TypeScript 5
- TailwindCSS 3
- Framer Motion
- Shadcn/ui
- Lucide React
- SWR pour la gestion du cache

### Backend
- Node.js avec Express
- MongoDB avec Mongoose
- JWT pour l'authentification
- Multer pour la gestion des fichiers
- Jest pour les tests

### Outils de Développement
- ESLint
- Prettier
- Husky
- Jest
- GitHub Actions

## 📦 Installation

### Prérequis
- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0 ou yarn >= 1.22.0
- Git

### Configuration

1. Cloner le projet :
```bash
git clone https://github.com/Lio2412/Le-monde-sucr-e-de-linda.git
cd le-monde-sucre-de-linda
```

2. Configuration du Backend :
```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables dans .env :
# MONGODB_URI=mongodb://localhost:27017/le-monde-sucre
# JWT_SECRET=votre_secret_jwt
# PORT=5000
```

3. Configuration du Frontend :
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Configurer les variables dans .env.local :
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Démarrage

1. Démarrer MongoDB :
```bash
# Windows
net start MongoDB
# Linux/MacOS
sudo systemctl start mongod
```

2. Démarrer le backend :
```bash
cd backend
npm run dev
```

3. Dans un nouveau terminal, démarrer le frontend :
```bash
cd frontend
npm run dev
```

L'application sera accessible à :
- Frontend : http://localhost:3000
- Backend : http://localhost:5000
- API Documentation : http://localhost:5000/api-docs

## 🏗 Structure du Projet

```
le-monde-sucre-de-linda/
├── backend/              # API Node.js/Express
│   ├── src/             # Code source
│   │   ├── controllers/ # Contrôleurs
│   │   ├── models/     # Modèles Mongoose
│   │   ├── routes/     # Routes API
│   │   └── utils/      # Utilitaires
│   ├── tests/          # Tests unitaires et d'intégration
│   └── package.json    # Dépendances backend
└── frontend/           # Application Next.js
    ├── src/
    │   ├── app/       # Pages et routes Next.js
    │   ├── components/ # Composants React
    │   ├── hooks/     # Custom hooks
    │   ├── lib/       # Utilitaires
    │   ├── types/     # Types TypeScript
    │   └── styles/    # Styles et configurations
    ├── public/        # Assets statiques
    └── package.json   # Dépendances frontend
```

## 🧪 Tests

```bash
# Lancer les tests unitaires
npm run test

# Lancer les tests avec couverture
npm run test:coverage
```

## 📚 Documentation

- [Guide de Contribution](./CONTRIBUTING.md)
- [Documentation API](./API.md)
- [Guide de Style](./STYLE_GUIDE.md)

## 🔄 Dernières Mises à Jour

- Correction des tests du mode cuisine (RecipeCookingMode)
- Amélioration de la gestion des hooks dans les tests
- Correction du mock useBeforeUnload
- Optimisation des tests avec meilleure gestion des timeouts
- Amélioration de la gestion des animations dans les tests
- Correction des problèmes d'accessibilité des dialogues
- Optimisation des images avec gestion automatique des tailles
- Correction des problèmes de rendu côté serveur
- Amélioration du mode cuisine avec timer et notes
- Mise à jour des dépendances vers les dernières versions
- Correction des tests du KeyboardShortcutsDialog
- Résolution des conflits de dépendances

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit (`git commit -m 'feat: ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/amelioration`)
5. Créer une Pull Request

## 📝 Licence

Ce projet est sous licence ISC. Voir le fichier `LICENSE` pour plus de détails.

## 📧 Contact

Linda - [linda@lemondesucre.fr](mailto:linda@lemondesucre.fr)

Projet : [https://github.com/Lio2412/Le-monde-sucr-e-de-linda](https://github.com/Lio2412/Le-monde-sucr-e-de-linda) 