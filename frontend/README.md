# Le Monde Sucré de Linda

Un site de recettes de pâtisserie moderne et interactif, construit avec Next.js 14, TypeScript, et TailwindCSS.

## 🌟 Fonctionnalités

- Mode cuisine interactif avec timer intégré
- Optimisation des images avec next/image
- Animations fluides avec Framer Motion
- SEO optimisé avec métadonnées dynamiques
- Design responsive et moderne
- Mode d'impression des recettes
- Système de partage social

## 🛠 Technologies

- Next.js 14
- TypeScript
- TailwindCSS
- Framer Motion
- Shadcn/ui
- Lucide Icons

## 📦 Installation

1. Clonez le repository :
```bash
git clone https://github.com/votre-username/le-monde-sucre-de-linda.git
cd le-monde-sucre-de-linda
```

2. Installez les dépendances :
```bash
cd frontend
npm install
```

3. Créez un fichier `.env.local` avec les variables d'environnement nécessaires :
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Lancez le serveur de développement :
```bash
npm run dev
```

## 🏗 Structure du Projet

```
frontend/
├── src/
│   ├── app/                 # Pages et routes Next.js
│   ├── components/          # Composants React réutilisables
│   ├── hooks/              # Custom hooks React
│   ├── lib/                # Utilitaires et configurations
│   ├── types/              # Types TypeScript
│   └── styles/             # Styles globaux et configurations TailwindCSS
├── public/                 # Assets statiques
└── ...
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

- Optimisation des images avec gestion automatique des tailles
- Correction des problèmes de rendu côté serveur
- Amélioration du mode cuisine avec timer
- Mise à jour des dépendances vers les dernières versions

## 📝 License

MIT 