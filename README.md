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

### Système de Partage
- Partage de photos des réalisations
- Notation des recettes (1-5 étoiles)
- Commentaires et retours d'expérience
- Galerie des réalisations de la communauté
- Optimisation automatique des images
- Nettoyage automatique du cache d'images

### Interface & Design
- Design responsive et moderne avec Tailwind CSS
- Animations fluides avec Framer Motion
- SEO optimisé avec métadonnées dynamiques
- Optimisation des images avec next/image
- Mode d'impression des recettes
- Système de partage social

## 🚧 État d'Avancement

### ✅ Fonctionnalités Complétées
- Configuration complète de Next.js avec TypeScript et SWC
- Mise en place de TailwindCSS et Framer Motion
- Composants UI réutilisables avec Shadcn/ui
- Optimisation des images et gestion du SEO
- Configuration CORS sécurisée
- Mode cuisine avec timer et notes
- Tests unitaires des composants principaux
- Système de partage des réalisations
- Gestion des uploads d'images
- Intégration avec PostgreSQL et Prisma

### 🔄 En Développement
- Pagination des partages
- Filtrage des réalisations
- Système de likes
- Notifications des nouveaux partages
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
- PostgreSQL avec Prisma
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
- PostgreSQL >= 15.0
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
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/le-monde-sucre?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET=votre_secret_jwt_super_securise
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

3. Configuration du Frontend :
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Configurer les variables dans .env.local :
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Démarrage

1. Démarrer PostgreSQL :
```bash
# Windows
net start postgresql-x64-15
# Linux/MacOS
sudo systemctl start postgresql
```

2. Démarrer le projet (frontend et backend) :
```bash
# Dans le dossier racine du projet
npm run dev
```

## 🔧 Notes de Configuration

### Configuration CORS
Le backend est configuré pour accepter les requêtes du frontend en développement (`http://localhost:3000`). Si vous changez le port du frontend, mettez à jour la variable `FRONTEND_URL` dans le fichier `.env` du backend.

### Configuration des Images
Le projet utilise `next/image` pour l'optimisation des images. Les domaines suivants sont autorisés :
- images.unsplash.com
- source.unsplash.com
- picsum.photos
- via.placeholder.com

Pour ajouter d'autres domaines d'images, modifiez le fichier `next.config.mjs`.

### Commandes PowerShell
Pour Windows, utilisez le point-virgule (`;`) comme séparateur de commandes au lieu de `&&` :
```powershell
cd backend; npm run dev
```

## 🐛 Résolution des Problèmes Courants

1. **Port déjà utilisé** :
```powershell
# Trouver le processus
netstat -ano | findstr :[PORT]
# Arrêter le processus
taskkill /F /PID [PID]
```

2. **Erreurs de compilation Next.js** :
```bash
# Nettoyer le cache
cd frontend
rm -r -force .next
npm run dev
```