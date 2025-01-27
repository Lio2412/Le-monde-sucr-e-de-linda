# Le Monde Sucré de Linda

Blog de pâtisserie élégant développé avec Next.js et Node.js, mettant en valeur des recettes gourmandes dans un design minimaliste et raffiné.

## État d'Avancement du Projet

### ✅ Fonctionnalités Implémentées

#### Architecture & Configuration
- [x] Configuration Next.js avec TypeScript
- [x] Mise en place de TailwindCSS
- [x] Configuration des providers (Motion, Theme, SWR)
- [x] Gestion des métadonnées et SEO
- [x] Structure de dossiers organisée
- [x] Configuration du backend Node.js/Express
- [x] Mise en place de MongoDB

#### Composants de Base
- [x] Header avec navigation responsive
- [x] Footer avec liens et réseaux sociaux
- [x] Layout principal
- [x] Composants UI réutilisables
- [x] Design système cohérent

#### Fonctionnalités Principales
- [x] Système de newsletter avec formulaire réutilisable
- [x] Système de commentaires avec likes
- [x] Système de notation des recettes
- [x] Gestion des erreurs et optimisations
- [x] Animations avec Framer Motion

### 🚧 Fonctionnalités en Cours

#### Pages Principales
- [ ] Page d'accueil avec mise en avant des recettes
- [ ] Page de listing des recettes avec filtres
- [ ] Page de détail des recettes
- [ ] Page de blog
- [ ] Page À propos
- [ ] Page de contact

#### Authentification
- [ ] Système de connexion/inscription
- [ ] Profil utilisateur
- [ ] Tableau de bord utilisateur
- [ ] Gestion des favoris

#### Fonctionnalités Avancées
- [ ] Système de recherche avancé
- [ ] Filtres de recettes (catégories, temps, difficulté)
- [ ] Système de tags
- [ ] Mode d'impression des recettes
- [ ] Partage sur réseaux sociaux

### 📋 Prochaines Étapes
1. Développement des pages principales
2. Implémentation du système d'authentification
3. Mise en place du système de recherche
4. Intégration des fonctionnalités sociales avancées
5. Tests et optimisations de performance
6. Déploiement et monitoring

## Design & Interface

### 🎨 Éléments de Design
- **Typographie** : Utilisation de Playfair Display pour les titres
- **Palette de couleurs** : Rose pastel, blanc et gris pour une ambiance douce
- **Images** : Format carré avec effets de transition subtils
- **Animations** : Transitions fluides avec Framer Motion

### 📱 Sections Principales
1. **En-tête**
   - Navigation épurée
   - Barre décorative rose pastel
   - Menu responsive avec Tailwind CSS

2. **Hero Section**
   - Grande image carrée optimisée
   - Titre élégant avec Playfair Display
   - Animations fluides avec Framer Motion

3. **Section Recettes**
   - Grille responsive avec Tailwind CSS
   - Badges de catégorie stylisés
   - Lazy loading des images

## Fonctionnalités Détaillées

### 📧 Système de Newsletter
- **Formulaire d'Inscription**
  - Design minimal et standard
  - Validation des emails
  - États de chargement
  - Animations fluides
  - Notifications avec Sonner
- **Points d'Intégration**
  - Page d'accueil (version minimale)
  - Page À propos (version standard)
  - Formulaire d'inscription
  - Tableau de bord

### 🤝 Fonctionnalités Sociales
- **Système de Partage**
  - Facebook, Instagram, Twitter
  - Copie de lien rapide
  - Interface intuitive
- **Commentaires**
  - Temps réel
  - Likes et réponses
  - Interface moderne
- **Notes**
  - Système 5 étoiles
  - Note moyenne
  - Mises à jour en temps réel

## Prérequis

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0 ou yarn >= 1.22.0
- Git

## Structure du Projet

```
le-monde-sucre-de-linda/
├── backend/              # API Node.js/Express
│   ├── src/             # Code source
│   ├── tests/           # Tests unitaires et d'intégration
│   └── package.json     # Dépendances backend
└── frontend/            # Application Next.js
    ├── src/             # Code source
    ├── public/          # Assets statiques
    └── package.json     # Dépendances frontend
```

## Installation

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

## Démarrage

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

## Technologies Utilisées

### Frontend
- Next.js 14
- TypeScript 5
- TailwindCSS 3
- Framer Motion
- Playfair Display
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

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit (`git commit -m 'feat: ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/amelioration`)
5. Créer une Pull Request

## Licence

Ce projet est sous licence ISC. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Linda - [linda@lemondesucre.fr](mailto:linda@lemondesucre.fr)

Projet : [https://github.com/Lio2412/Le-monde-sucr-e-de-linda](https://github.com/Lio2412/Le-monde-sucr-e-de-linda) 