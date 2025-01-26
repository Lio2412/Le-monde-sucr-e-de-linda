# Le Monde Sucré de Linda

Blog de pâtisserie élégant développé avec Next.js et Node.js, mettant en valeur des recettes gourmandes dans un design minimaliste et raffiné.

## Design & Interface

Le site adopte un design minimaliste et élégant avec une palette de couleurs pastel :

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

4. **Newsletter**
   - Design minimaliste
   - Validation des formulaires côté client et serveur

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
- Framer Motion pour les animations
- Playfair Display (Google Fonts)
- Lucide React pour les icônes

### Backend
- Node.js avec Express
- MongoDB avec Mongoose
- JWT pour l'authentification
- Multer pour la gestion des fichiers
- Jest pour les tests

### Outils de Développement
- ESLint
- Prettier
- Husky pour les pre-commit hooks
- Jest pour les tests
- GitHub Actions pour la CI/CD

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