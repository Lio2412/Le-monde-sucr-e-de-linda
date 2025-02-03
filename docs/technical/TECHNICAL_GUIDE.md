# Guide Technique - Le Monde Sucré de Linda

## 🏗️ Architecture du Projet

### Structure des Dossiers
```
frontend/
├── src/
│   ├── app/              # Pages et routes Next.js
│   ├── components/       # Composants React réutilisables
│   ├── hooks/           # Hooks personnalisés
│   ├── lib/             # Utilitaires et configurations
│   ├── services/        # Services et logique métier
│   └── types/           # Types TypeScript
├── public/              # Fichiers statiques
└── tests/              # Tests (unitaires, e2e, etc.)
```

### Technologies Principales
- **Frontend**: Next.js 14 avec App Router
- **UI**: React 18 avec TailwindCSS
- **État**: React Context et Hooks
- **Tests**: Vitest et Playwright
- **Styles**: TailwindCSS et Shadcn/ui

## 🔧 Configuration

### Prérequis
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm run dev

# Build de production
npm run build
```

## 🧪 Tests

### Tests Unitaires
```bash
# Exécution des tests unitaires
npm run test

# Avec couverture
npm run test:coverage
```

### Tests d'Intégration
```bash
# Installation de Playwright
npx playwright install

# Exécution des tests e2e
npm run test:e2e
```

## 📦 Services

### MetadataService
Service pour la gestion des métadonnées SEO.

```typescript
interface Metadata {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  url?: string;
  type?: string;
  locale?: string;
}

// Méthodes principales
- getMetadata(path: string): Promise<Metadata>
- updateMetadata(path: string, metadata: Metadata): Promise<Metadata>
- generateSitemap(): Promise<void>
- generateSchemaOrg(type: 'Recipe' | 'BlogPosting', data: any): Promise<string>
```

## 🔒 Sécurité

### Authentication
- JWT pour l'authentification des requêtes API
- Middleware de protection des routes administrateur
- Gestion des sessions avec refresh tokens

### Validation des Données
- Validation côté client avec React Hook Form
- Validation côté serveur avec Zod
- Sanitization des entrées utilisateur

## 🎨 Composants UI

### Système de Design
- Utilisation de Shadcn/ui pour les composants de base
- Thème personnalisé avec TailwindCSS
- Animations avec Framer Motion

### Composants Principaux
```typescript
// Exemple de composant avec types
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

## 📊 Analytics et SEO

### Métriques
- Suivi des vues de pages
- Engagement utilisateur
- Performance des recettes et articles

### SEO
- Métadonnées dynamiques
- Sitemaps automatiques
- Schémas Schema.org pour les recettes et articles

## 🚀 Performance

### Optimisations
- Images optimisées avec next/image
- Lazy loading des composants
- Mise en cache des requêtes API

### Métriques Clés
- First Contentful Paint < 1.5s
- Time to Interactive < 3.0s
- Performance Score > 90

## 🐛 Débogage

### Outils
- Chrome DevTools pour le débogage frontend
- React DevTools pour l'inspection des composants
- Logging avec debug

### Logs
```typescript
// Niveaux de log
error: Erreurs critiques
warn: Avertissements
info: Informations générales
debug: Informations de débogage
```

## 📱 Responsive Design

### Breakpoints
```typescript
// Points de rupture TailwindCSS
sm: '640px'   // Mobile
md: '768px'   // Tablette
lg: '1024px'  // Desktop
xl: '1280px'  // Large Desktop
```

## 🔄 CI/CD

### Pipeline
1. Lint et vérification des types
2. Tests unitaires
3. Tests d'intégration
4. Build et déploiement

### Scripts
```bash
# Vérification complète
npm run ci

# Déploiement
npm run deploy
``` 