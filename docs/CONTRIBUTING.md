# Guide de Contribution - Le Monde Sucré de Linda

## 👋 Introduction

Merci de contribuer au projet Le Monde Sucré de Linda ! Ce guide vous aidera à comprendre notre processus de développement et nos standards de code.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation
```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/le-monde-sucre-de-linda.git

# Installer les dépendances
cd le-monde-sucre-de-linda
npm install

# Démarrer en développement
npm run dev
```

## 📝 Processus de Contribution

### 1. Issues
- Vérifiez les issues existantes
- Créez une nouvelle issue si nécessaire
- Attendez l'assignation avant de commencer

### 2. Branches
```bash
# Créer une nouvelle branche
git checkout -b type/description

# Types de branches
feature/   # Nouvelle fonctionnalité
fix/       # Correction de bug
docs/      # Documentation
refactor/  # Refactoring
test/      # Tests
```

### 3. Commits
```bash
# Format des messages
<type>(<scope>): <description>

# Exemple
feat(auth): ajouter la validation du token JWT
```

### 4. Pull Requests
1. Mettez à jour votre branche
2. Créez la PR avec le template
3. Attendez la review
4. Appliquez les modifications demandées

## 🎨 Standards de Code

### Style de Code
```typescript
// Bon exemple
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

// Mauvais exemple
function calc(i: any): any {
  let t = 0;
  for(let x of i) t += x.p;
  return t;
}
```

### Nommage
- Variables: camelCase
- Classes: PascalCase
- Constantes: UPPER_SNAKE_CASE
- Fichiers: kebab-case.ts

### Documentation
```typescript
/**
 * Calcule le total des prix des articles
 * @param items - Liste des articles
 * @returns Le total calculé
 */
function calculateTotal(items: Item[]): number {
  // ...
}
```

## 🧪 Tests

### Tests Unitaires
```typescript
describe('calculateTotal', () => {
  it('devrait calculer correctement le total', () => {
    const items = [
      { price: 10 },
      { price: 20 }
    ];
    expect(calculateTotal(items)).toBe(30);
  });
});
```

### Tests d'Intégration
```typescript
test('devrait gérer le workflow complet', async ({ page }) => {
  await page.goto('/admin');
  await page.fill('input[name="email"]', 'test@example.com');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## 🏗️ Architecture

### Structure des Composants
```typescript
// components/MyComponent/index.tsx
export { default } from './MyComponent';

// components/MyComponent/MyComponent.tsx
import styles from './MyComponent.module.css';

interface Props {
  // ...
}

export default function MyComponent({ ...props }: Props) {
  // ...
}
```

### Gestion de l'État
```typescript
// hooks/useMyState.ts
export function useMyState() {
  const [state, setState] = useState<State>({});
  // ...
  return { state, actions };
}
```

## 🔒 Sécurité

### Bonnes Pratiques
- Validez toutes les entrées utilisateur
- Utilisez des tokens CSRF
- Évitez les injections SQL
- Gérez correctement les erreurs

### Exemple
```typescript
// Bon exemple
const sanitizedInput = sanitizeHtml(userInput);
await db.query('SELECT * FROM users WHERE id = ?', [userId]);

// Mauvais exemple
await db.query(`SELECT * FROM users WHERE id = ${userId}`);
```

## 🚀 Performance

### Optimisations
- Utilisez le lazy loading
- Optimisez les images
- Minimisez les re-renders
- Mettez en cache les requêtes

### Exemple
```typescript
// Bon exemple
const MemoizedComponent = React.memo(MyComponent);
const cachedData = useMemo(() => expensiveCalculation(), [deps]);

// Mauvais exemple
const recalculatedValue = expensiveCalculation(); // À chaque render
```

## 📱 Responsive Design

### Breakpoints
```scss
// Utiliser les breakpoints TailwindCSS
@screen sm { // >= 640px
  // Styles mobile
}

@screen md { // >= 768px
  // Styles tablette
}

@screen lg { // >= 1024px
  // Styles desktop
}
```

## 🐛 Débogage

### Logs
```typescript
// Niveaux de log appropriés
logger.error('Erreur critique');
logger.warn('Avertissement');
logger.info('Information');
logger.debug('Détails de débogage');
```

## 📚 Resources

### Documentation
- [Next.js](https://nextjs.org/docs)
- [React](https://reactjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [TailwindCSS](https://tailwindcss.com/docs)

### Outils Recommandés
- VS Code avec extensions :
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense

## ❓ Questions Fréquentes

### Q: Comment déboguer les tests ?
R: Utilisez `debugger` ou les outils de débogage de VS Code.

### Q: Comment mettre à jour les dépendances ?
R: Utilisez `npm outdated` puis `npm update`. 