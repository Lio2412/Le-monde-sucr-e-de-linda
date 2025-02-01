## Mise à Jour Récentes
Optimisation de la gestion du rôle USER : Le backend a été modifié pour charger l'utilisateur complet avec ses rôles via Prisma, améliorant ainsi la fiabilité des contrôles d'accès. Les tests d'intégration ont été ajustés pour garantir l'unicité des emails lors des inscriptions.

---

# 📱 Guide des Composants UI

## Composants Communs

### Boutons
```tsx
// Bouton Principal
<Button 
  variant="primary" 
  size="lg"
  onClick={handleClick}
  disabled={isLoading}
  className="w-full md:w-auto"
>
  Se connecter
</Button>

// Bouton Secondaire avec icône
<Button 
  variant="outline" 
  size="md"
  leftIcon={<ArrowLeftIcon />}
>
  Retour
</Button>

// Bouton de Soumission avec état de chargement
<Button 
  type="submit" 
  loading={isLoading}
  loadingText="Envoi en cours..."
  className="bg-primary hover:bg-primary-dark"
>
  {isLoading ? 'Chargement...' : 'Envoyer'}
</Button>

// Bouton de suppression avec confirmation
<Button 
  variant="danger"
  size="sm"
  onClick={() => setShowConfirmDialog(true)}
  className="text-white bg-red-600 hover:bg-red-700"
>
  Supprimer
</Button>
```

### Formulaires
```tsx
// Champ de texte avec validation
<Input
  type="email"
  label="Adresse email"
  placeholder="exemple@email.com"
  error={errors.email}
  helperText="Nous ne partagerons jamais votre email"
  required
  {...register('email', {
    required: 'L\'email est requis',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Email invalide'
    }
  })}
/>

// Champ de mot de passe avec indicateur de force
<PasswordInput
  label="Mot de passe"
  placeholder="Minimum 8 caractères"
  showStrength
  strengthIndicator={(score) => {
    if (score < 2) return 'Faible';
    if (score < 3) return 'Moyen';
    return 'Fort';
  }}
  {...register('password', {
    required: 'Le mot de passe est requis',
    minLength: {
      value: 8,
      message: 'Le mot de passe doit contenir au moins 8 caractères'
    }
  })}
/>

// Select avec groupes
<Select
  label="Catégorie"
  placeholder="Choisir une catégorie"
  groups={[
    {
      label: 'Pâtisseries',
      options: [
        { value: 'tartes', label: 'Tartes' },
        { value: 'gateaux', label: 'Gâteaux' },
        { value: 'viennoiseries', label: 'Viennoiseries' }
      ]
    },
    {
      label: 'Autres',
      options: [
        { value: 'boissons', label: 'Boissons' },
        { value: 'glaces', label: 'Glaces' }
      ]
    }
  ]}
  onChange={handleCategoryChange}
/>

// Textarea avec compteur de caractères
<Textarea
  label="Description"
  placeholder="Décrivez votre recette..."
  maxLength={500}
  showCount
  {...register('description')}
/>

// Upload d'image avec preview
<ImageUpload
  label="Photo de la recette"
  accept="image/*"
  maxSize={5 * 1024 * 1024} // 5MB
  onUpload={handleImageUpload}
  preview
  error={errors.image}
/>
```

### Notifications
```tsx
// Toast de succès avec action
<Toast
  type="success"
  title="Recette publiée"
  description="Votre recette a été publiée avec succès !"
  duration={5000}
  action={{
    label: 'Voir',
    onClick: () => router.push(`/recettes/${recipeId}`)
  }}
/>

// Toast d'erreur avec détails
<Toast
  type="error"
  title="Erreur de connexion"
  description="Email ou mot de passe incorrect"
  icon={<AlertCircleIcon />}
  closeable
/>

// Toast d'information avec progress
<Toast
  type="info"
  title="Téléchargement en cours"
  description={`${progress}% complété`}
  progress={progress}
/>

// Notification système
<SystemNotification
  title="Nouvelle commande"
  body="Vous avez reçu une nouvelle commande !"
  icon="/icons/order.png"
  onClick={handleNotificationClick}
/>
```

## Styles et Thème

### Couleurs
```css
:root {
  /* Couleurs principales */
  --primary: #FF6B6B;
  --primary-light: #FF8787;
  --primary-dark: #FA5252;
  --secondary: #4ECDC4;
  
  /* Tons de gris */
  --gray-50: #F8F9FA;
  --gray-100: #E9ECEF;
  --gray-200: #DEE2E6;
  --gray-300: #CED4DA;
  --gray-400: #ADB5BD;
  --gray-500: #6C757D;
  --gray-600: #495057;
  --gray-700: #343A40;
  --gray-800: #212529;
  --gray-900: #121416;
  
  /* États */
  --success: #37B24D;
  --success-light: #51CF66;
  --success-dark: #2F9E44;
  
  --error: #FA5252;
  --error-light: #FF6B6B;
  --error-dark: #E03131;
  
  --warning: #FCC419;
  --warning-light: #FFD43B;
  --warning-dark: #F59F00;
  
  --info: #228BE6;
  --info-light: #339AF0;
  --info-dark: #1971C2;
  
  /* Couleurs sémantiques */
  --background: #FFFFFF;
  --text: var(--gray-900);
  --text-light: var(--gray-600);
  --border: var(--gray-200);
  --input: var(--gray-100);
  --placeholder: var(--gray-500);
}
```

### Typographie
```css
:root {
  /* Familles de polices */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-serif: 'Playfair Display', Georgia, Cambria, serif;
  --font-mono: 'Fira Code', Consolas, Monaco, monospace;
  
  /* Tailles */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Poids */
  --font-thin: 100;
  --font-extralight: 200;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  
  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

### Espacement
```css
:root {
  /* Espacements */
  --spacing-px: 1px;
  --spacing-0: 0;
  --spacing-0.5: 0.125rem;  /* 2px */
  --spacing-1: 0.25rem;     /* 4px */
  --spacing-1.5: 0.375rem;  /* 6px */
  --spacing-2: 0.5rem;      /* 8px */
  --spacing-2.5: 0.625rem;  /* 10px */
  --spacing-3: 0.75rem;     /* 12px */
  --spacing-3.5: 0.875rem;  /* 14px */
  --spacing-4: 1rem;        /* 16px */
  --spacing-5: 1.25rem;     /* 20px */
  --spacing-6: 1.5rem;      /* 24px */
  --spacing-8: 2rem;        /* 32px */
  --spacing-10: 2.5rem;     /* 40px */
  --spacing-12: 3rem;       /* 48px */
  --spacing-16: 4rem;       /* 64px */
  --spacing-20: 5rem;       /* 80px */
  --spacing-24: 6rem;       /* 96px */
  --spacing-32: 8rem;       /* 128px */
  
  /* Marges négatives */
  --spacing-n1: -0.25rem;
  --spacing-n2: -0.5rem;
  --spacing-n4: -1rem;
  --spacing-n8: -2rem;
}
```

## Layouts

### Grid System
```tsx
// Grid responsive avec colonnes automatiques
<Grid 
  cols={[1, 2, 3, 4]} 
  gap={4}
  className="auto-rows-fr"
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
  <Card>Item 4</Card>
</Grid>

// Grid avec zones nommées
<Grid
  areas={{
    base: `
      "header"
      "nav"
      "main"
      "footer"
    `,
    md: `
      "header header"
      "nav main"
      "footer footer"
    `
  }}
  columns={{ base: 1, md: 2 }}
  gap={4}
>
  <GridItem area="header"><Header /></GridItem>
  <GridItem area="nav"><Nav /></GridItem>
  <GridItem area="main"><Main /></GridItem>
  <GridItem area="footer"><Footer /></GridItem>
</Grid>

// Flex container avec responsive
<Flex 
  direction={{ base: 'column', md: 'row' }}
  align={{ base: 'stretch', md: 'center' }}
  justify="space-between"
  wrap="wrap"
  gap={4}
>
  <Box flex="1"><Sidebar /></Box>
  <Box flex="2"><Content /></Box>
</Flex>
```

### Conteneurs
```tsx
// Page container avec padding responsive
<Container 
  maxWidth={{ base: '100%', sm: '540px', md: '720px', lg: '960px', xl: '1140px' }}
  px={{ base: 4, md: 6, lg: 8 }}
  mx="auto"
>
  <Content />
</Container>

// Section avec espacement vertical
<Section 
  spacing={{ base: 'md', lg: 'lg' }}
  bg="gray.50"
  py={{ base: 8, md: 12, lg: 16 }}
>
  <SectionTitle 
    fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
    mb={{ base: 4, md: 6 }}
  >
    Nos Meilleures Recettes
  </SectionTitle>
  <RecipeGrid />
</Section>

// Layout avec sidebar
<Layout>
  <Sidebar
    width={{ base: 'full', md: '64' }}
    position={{ base: 'static', md: 'fixed' }}
  />
  <Main
    ml={{ base: 0, md: '64' }}
    p={{ base: 4, md: 6, lg: 8 }}
  />
</Layout>
```

## Composants Spécifiques

### AuthForm
```tsx
export const AuthForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast({
        title: 'Connexion réussie',
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        status: 'error'
      });
    }
  };

  return (
    <Form 
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-md mx-auto"
    >
      <FormField>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...register('email', {
            required: 'L\'email est requis',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email invalide'
            }
          })}
        />
        {errors.email && (
          <FormErrorMessage>{errors.email.message}</FormErrorMessage>
        )}
      </FormField>

      <FormField>
        <FormLabel htmlFor="password">Mot de passe</FormLabel>
        <PasswordInput
          id="password"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          error={errors.password}
          {...register('password', {
            required: 'Le mot de passe est requis',
            minLength: {
              value: 8,
              message: 'Le mot de passe doit contenir au moins 8 caractères'
            }
          })}
        />
        {errors.password && (
          <FormErrorMessage>{errors.password.message}</FormErrorMessage>
        )}
      </FormField>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={isSubmitting || isLoading}
        loadingText="Connexion en cours..."
      >
        Se connecter
      </Button>
    </Form>
  );
};
```

### RecipeCard
```tsx
interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    image: string;
    duration: number;
    difficulty: 'facile' | 'moyen' | 'difficile';
    rating: number;
    author: {
      name: string;
      avatar: string;
    };
  };
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onFavorite,
  isFavorited
}) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
    <CardImage
      src={recipe.image}
      alt={recipe.title}
      aspectRatio="4/3"
      className="object-cover"
    />
    
    <CardBody className="p-4 space-y-4">
      <CardHeader className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-serif">{recipe.title}</CardTitle>
          <CardSubtitle className="text-gray-600">
            Par {recipe.author.name}
          </CardSubtitle>
        </div>
        
        {onFavorite && (
          <IconButton
            icon={isFavorited ? <HeartFilledIcon /> : <HeartIcon />}
            variant="ghost"
            aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            onClick={() => onFavorite(recipe.id)}
          />
        )}
      </CardHeader>

      <CardDescription className="text-sm line-clamp-2">
        {recipe.description}
      </CardDescription>

      <RecipeStats
        duration={recipe.duration}
        difficulty={recipe.difficulty}
        rating={recipe.rating}
        className="grid grid-cols-3 gap-2"
      />
    </CardBody>
  </Card>
);

const RecipeStats: React.FC<RecipeStatsProps> = ({
  duration,
  difficulty,
  rating,
  className
}) => (
  <div className={className}>
    <Stat
      icon={<ClockIcon />}
      label="Durée"
      value={`${duration} min`}
    />
    <Stat
      icon={<ChartIcon />}
      label="Difficulté"
      value={difficulty}
    />
    <Stat
      icon={<StarIcon />}
      label="Note"
      value={`${rating}/5`}
    />
  </div>
);
```

## Responsive Design

### Breakpoints
```typescript
export const breakpoints = {
  'xs': '320px',   // Petits mobiles
  'sm': '640px',   // Mobiles
  'md': '768px',   // Tablettes
  'lg': '1024px',  // Petits écrans
  'xl': '1280px',  // Écrans moyens
  '2xl': '1536px', // Grands écrans
};

// Hooks utilitaires
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState(getBreakpoint());

  useEffect(() => {
    const handleResize = () => setBreakpoint(getBreakpoint());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};
```

### Media Queries
```scss
// Mixins SCSS pour responsive
@mixin responsive($breakpoint) {
  @if $breakpoint == xs {
    @media (min-width: 320px) { @content; }
  }
  @if $breakpoint == sm {
    @media (min-width: 640px) { @content; }
  }
  @if $breakpoint == md {
    @media (min-width: 768px) { @content; }
  }
  @if $breakpoint == lg {
    @media (min-width: 1024px) { @content; }
  }
  @if $breakpoint == xl {
    @media (min-width: 1280px) { @content; }
  }
  @if $breakpoint == 2xl {
    @media (min-width: 1536px) { @content; }
  }
}

// Utilisation
.container {
  width: 100%;
  padding: var(--spacing-4);
  
  @include responsive(sm) {
    max-width: 640px;
    padding: var(--spacing-6);
  }
  
  @include responsive(md) {
    max-width: 768px;
    padding: var(--spacing-8);
  }
  
  @include responsive(lg) {
    max-width: 1024px;
    padding: var(--spacing-10);
  }
  
  @include responsive(xl) {
    max-width: 1280px;
  }
}

// Classes utilitaires responsive
.hide-on-mobile {
  @media (max-width: 639px) {
    display: none;
  }
}

.show-on-mobile {
  @media (min-width: 640px) {
    display: none;
  }
}
```

## Animations

### Transitions
```css
/* Variables de transition */
:root {
  --transition-fast: 150ms;
  --transition-normal: 250ms;
  --transition-slow: 350ms;
  --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Transitions communes */
.button {
  transition: all var(--transition-normal) var(--transition-timing);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
}

/* Animation de fade */
.fade-enter {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity var(--transition-normal) var(--transition-timing),
              transform var(--transition-normal) var(--transition-timing);
}

.fade-exit {
  opacity: 1;
  transform: translateY(0);
}

.fade-exit-active {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity var(--transition-normal) var(--transition-timing),
              transform var(--transition-normal) var(--transition-timing);
}
```

### Loading States
```tsx
// Spinner personnalisé
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  thickness = 2,
  speed = 0.75,
  ...props
}) => {
  const sizeValue = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem'
  }[size];

  return (
    <div
      className={`spinner-${size} text-${color}`}
      style={{
        width: sizeValue,
        height: sizeValue,
        borderWidth: `${thickness}px`,
        animationDuration: `${speed}s`
      }}
      {...props}
    />
  );
};

// Skeleton loader
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  animation = 'wave',
  width,
  height,
  ...props
}) => (
  <div
    className={`skeleton skeleton-${variant} skeleton-${animation}`}
    style={{ width, height }}
    {...props}
  />
);

// Composant de chargement de page
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="space-y-4 text-center">
      <Spinner size="lg" />
      <p className="text-gray-600">Chargement en cours...</p>
    </div>
  </div>
);

// Skeleton pour recette
export const RecipeSkeleton = () => (
  <div className="space-y-4">
    <Skeleton height="200px" />
    <Skeleton width="70%" height="24px" />
    <Skeleton width="40%" height="16px" />
    <div className="grid grid-cols-3 gap-4">
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
    </div>
  </div>
);
```

## Accessibilité

### ARIA Labels et Rôles
```tsx
// Bouton accessible
<button
  role="button"
  aria-label="Se connecter"
  aria-disabled={isLoading}
  aria-busy={isLoading}
  onClick={handleLogin}
  disabled={isLoading}
  className={`btn ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  {isLoading ? (
    <>
      <Spinner size="sm" className="mr-2" />
      <span className="sr-only">Chargement en cours</span>
      Connexion...
    </>
  ) : (
    'Se connecter'
  )}
</button>

// Menu déroulant accessible
<div role="navigation" aria-label="Menu principal">
  <button
    id="menu-button"
    aria-haspopup="true"
    aria-expanded={isOpen}
    aria-controls="menu-items"
    onClick={() => setIsOpen(!isOpen)}
  >
    Menu
  </button>
  
  {isOpen && (
    <ul
      id="menu-items"
      role="menu"
      aria-labelledby="menu-button"
      className="menu"
    >
      <li role="none">
        <a role="menuitem" href="/recettes">
          Recettes
        </a>
      </li>
      {/* Autres items */}
    </ul>
  )}
</div>

// Dialog modal accessible
<Dialog
  isOpen={isOpen}
  onClose={onClose}
  initialFocus={cancelRef}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogOverlay />
  <DialogContent role="dialog">
    <h2 id="dialog-title">Confirmation</h2>
    <p id="dialog-description">
      Êtes-vous sûr de vouloir supprimer cette recette ?
    </p>
    <DialogActions>
      <Button ref={cancelRef} onClick={onClose}>
        Annuler
      </Button>
      <Button onClick={handleDelete} variant="danger">
        Supprimer
      </Button>
    </DialogActions>
  </DialogContent>
</Dialog>
```

### Focus Management
```tsx
// Hook de gestion du focus
export const useFocusTrap = (isActive: boolean) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return ref;
};

// Styles de focus
const focusStyles = css`
  /* Focus visible */
  :focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }

  /* Focus within pour les groupes */
  .focus-group:focus-within {
    border-color: var(--primary);
  }

  /* Skip link */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    padding: 8px;
    background: var(--primary);
    color: white;
    z-index: 100;

    &:focus {
      top: 0;
    }
  }
`;
```

## 🔍 SearchBar

### Description
Barre de recherche intelligente avec suggestions en temps réel et historique des recherches.

### Props
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  placeholder?: string;
  maxSuggestions?: number;
}
```

### Accessibilité
- Role: `search`
- ARIA: `aria-expanded`, `aria-controls`
- Focus management
- Keyboard navigation

### Tests
✅ Tests E2E (5/5)
- Navigation au clavier
- Suggestions
- Historique
- Accessibilité
- Focus management

## 🗃️ RecipeCard

### Description
Carte affichant les informations d'une recette avec bouton like.

### Props
```typescript
interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    image: string;
    difficulty: string;
    time: number;
    isLiked?: boolean;
  };
  onLike: (id: string) => void;
  onShare?: (id: string) => void;
}
```

### Accessibilité
- ARIA: `aria-label`, `aria-pressed`
- Focus visible
- Keyboard interaction
- Color contrast

### Tests
✅ Tests E2E (5/5)
- Like functionality
- Share functionality
- Keyboard navigation
- ARIA attributes
- Visual feedback

## 🔘 Button

### Description
Bouton réutilisable avec différentes variantes.

### Props
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'text';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
```

### Accessibilité
- Role: `button`
- ARIA: `aria-disabled`, `aria-busy`
- Focus styles
- Loading state

### Variantes
- Primary: Action principale
- Secondary: Action secondaire
- Text: Lien stylisé

## 📝 Input

### Description
Champ de saisie avec validation et feedback.

### Props
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}
```

### Accessibilité
- ARIA: `aria-invalid`, `aria-describedby`
- Label association
- Error feedback

## 🏷️ Tag

### Description
Étiquette pour catégories et filtres.

### Props
```typescript
interface TagProps {
  label: string;
  color?: 'default' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  onRemove?: () => void;
}
```

### Accessibilité
- Role: `status`
- ARIA: `aria-label`
- Interactive removal

## 🎯 Styles Communs

### Thème
```typescript
const theme = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    text: '#2D3436',
    background: '#FFFFFF',
    error: '#FF5252',
    success: '#4CAF50'
  },
  typography: {
    h1: '2.5rem',
    h2: '2rem',
    body: '1rem',
    small: '0.875rem'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
};
```

### Breakpoints
```typescript
const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
};
```

## 📱 Responsive Design

### Media Queries
```typescript
const media = {
  mobile: `@media (min-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
  wide: `@media (min-width: ${breakpoints.wide})`
};
```

### Grille
```typescript
const grid = {
  container: '1200px',
  gutter: '1rem',
  columns: 12
};
```

## 🎨 Animations

### Transitions
```typescript
const transitions = {
  default: '0.3s ease',
  fast: '0.15s ease',
  slow: '0.5s ease'
};
```

### Keyframes
```typescript
const keyframes = {
  fadeIn: `
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  slideIn: `
    from { transform: translateY(20px); }
    to { transform: translateY(0); }
  `
};
```

## 🔒 Best Practices

### Accessibilité
1. Labels explicites
2. ARIA attributes
3. Focus management
4. Keyboard navigation
5. Color contrast

### Performance
1. Lazy loading
2. Code splitting
3. Memoization
4. Bundle optimization
5. Image optimization

### Maintenance
1. Documentation
2. Tests
3. Props validation
4. Error boundaries
5. Consistent naming

## 📚 Usage

### Installation
```bash
npm install @le-monde-sucre/ui
```

### Import
```typescript
import { Button, Input, RecipeCard } from '@le-monde-sucre/ui';
```

### Exemple
```tsx
const SearchPage = () => {
  const [query, setQuery] = useState('');
  
  return (
    <div>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Rechercher une recette..."
      />
      <Button
        variant="primary"
        onClick={() => handleSearch(query)}
      >
        Rechercher
      </Button>
    </div>
  );
};