# Le Monde Sucré de Linda

Blog de pâtisserie élégant développé avec Next.js et Node.js, mettant en valeur des recettes gourmandes dans un design minimaliste et raffiné.

## Design & Interface

Le site adopte un design minimaliste et élégant avec une palette de couleurs pastel :

### 🎨 Éléments de Design
- **Typographie** : Utilisation de Playfair Display pour les titres
- **Palette de couleurs** : Rose pastel, blanc et gris pour une ambiance douce
- **Images** : Format carré avec effets de transition subtils
- **Animations** : Transitions fluides et effets de survol élégants

### 📱 Sections Principales
1. **En-tête**
   - Navigation épurée
   - Barre décorative rose pastel
   - Menu responsive

2. **Hero Section**
   - Grande image carrée
   - Titre élégant avec Playfair Display
   - Boutons d'action stylisés

3. **Section Recettes**
   - Grille de recettes avec images carrées
   - Badges de catégorie
   - Informations structurées

4. **Newsletter**
   - Design minimaliste
   - Formulaire d'inscription élégant

## Prérequis

- Node.js >= 18.0.0
- MongoDB
- npm ou yarn

## Structure du Projet

```
le-monde-sucre-de-linda/
├── backend/           # API Node.js/Express
└── frontend/         # Application Next.js
```

## Installation

1. Cloner le projet :
```bash
git clone <URL_DU_REPO>
cd le-monde-sucre-de-linda
```

2. Installer les dépendances du backend :
```bash
cd backend
npm install
```

3. Configurer les variables d'environnement du backend :
```bash
cp .env.example .env
# Modifier les variables dans .env selon votre configuration
```

4. Installer les dépendances du frontend :
```bash
cd ../frontend
npm install
```

## Démarrage

1. Démarrer le backend :
```bash
cd backend
npm run dev
```

2. Dans un nouveau terminal, démarrer le frontend :
```bash
cd frontend
npm run dev
```

L'application sera accessible à :
- Frontend : http://localhost:3000
- Backend : http://localhost:5000

## Technologies Utilisées

### Frontend
- Next.js 14
- TypeScript
- TailwindCSS
- Framer Motion pour les animations
- Playfair Display (Google Fonts)
- Composants UI personnalisés

### Backend
- Node.js
- Express
- MongoDB
- JWT pour l'authentification
- Nodemailer pour les emails

### Design
- Design System personnalisé
- Palette de couleurs pastel
- Composants réutilisables
- Interface responsive

## Fonctionnalités

- 🍰 Gestion des recettes de pâtisserie
- 👤 Authentification des utilisateurs
- 📝 Blog avec articles et commentaires
- 📧 Newsletter
- 📱 Design responsive
- 🎨 Interface moderne et élégante
- ✨ Animations fluides
- 🔍 Recherche de recettes

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/NouvelleFeature`)
3. Commit vos changements (`git commit -m 'Ajout d'une nouvelle feature'`)
4. Push vers la branche (`git push origin feature/NouvelleFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence ISC. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Linda - [votre-email@example.com]

Lien du projet : [https://github.com/votre-username/le-monde-sucre-de-linda] 