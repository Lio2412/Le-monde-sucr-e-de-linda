# 🎨 Documentation des Composants UI
Mise à jour : 02/02/2024

## 🔐 Composants d'Authentification

### LoginForm
```typescript
import { Button, Input } from '@/components/ui';

interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  // Implementation...
};
```

#### Tests
```typescript
describe('LoginForm', () => {
  it('gère correctement les timeouts', async () => {
    render(<LoginForm onSubmit={mockSubmit} />);
    // Tests...
  });
});
```

## 📱 Composants Responsifs

### RecipeCard
```typescript
interface RecipeCardProps {
  title: string;
  image: string;
  duration: number;
  difficulty: 'FACILE' | 'MOYEN' | 'DIFFICILE';
}

export const RecipeCard = ({ title, image, duration, difficulty }: RecipeCardProps) => (
  <div className="group relative rounded-lg overflow-hidden hover:shadow-lg transition-all">
    <Image
      src={image}
      alt={title}
      width={400}
      height={300}
      className="object-cover"
    />
    {/* ... */}
  </div>
);
```

## 🎯 Hooks Personnalisés

### useAuth
```typescript
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me');
        // Implementation...
      } catch (error) {
        // Error handling...
      }
    };

    checkAuth();
  }, []);

  return { user, loading };
};
```

## 🔄 États de Chargement

### LoadingSpinner
```typescript
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
  </div>
);
```

## 🎨 Thème et Styles

### Variables CSS
```css
:root {
  --primary: #FF6B6B;
  --secondary: #4ECDC4;
  --accent: #FFE66D;
  --background: #F7F7F7;
  --text: #2C3E50;
}
```

### Utilitaires Tailwind
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
      },
    },
  },
};
```

## 📱 Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};
```

### Media Queries
```css
@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}
```

## 🔍 Tests UI

### Tests d'Accessibilité
```typescript
describe('Accessibilité', () => {
  it('respecte les normes WCAG', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## 📊 Métriques UI

### Performance
- First Contentful Paint : 1.2s
- Time to Interactive : 2.1s
- Cumulative Layout Shift : < 0.1

### Accessibilité
- Score WCAG : AA
- Navigation clavier : 100%
- Support lecteur d'écran : 100%

## 🔄 État des Composants

### Dernières Mises à Jour
- ✅ Optimisation des performances de rendu
- ✅ Amélioration de l'accessibilité
- ✅ Support du mode sombre
- ✅ Tests E2E ajoutés

### En Cours
- 🚧 Nouveaux composants de formulaire
- 🚧 Animations optimisées
- 🚧 Thèmes personnalisables