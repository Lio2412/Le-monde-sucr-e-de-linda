# 🔐 Sécurité

## Authentification

### JWT (JSON Web Tokens)
- **Durée de validité** : 24h
- **Secret** : Configuré via `JWT_SECRET` dans `.env`
- **Stockage** : LocalStorage (côté client)
- **Renouvellement** : Automatique si token valide
- **Structure** :
  ```json
  {
    "header": {
      "alg": "HS256",
      "typ": "JWT"
    },
    "payload": {
      "userId": "string",
      "email": "string",
      "role": "ADMIN | PATISSIER | USER",
      "iat": "timestamp",
      "exp": "timestamp"
    }
  }
  ```

### Gestion des Sessions
1. **Création**
   - Login réussi → Génération JWT
   - Stockage des métadonnées Redis
   - Durée de vie configurable

2. **Validation**
   - Vérification signature JWT
   - Validation expiration
   - Vérification blacklist

3. **Renouvellement**
   - Automatique si < 1h d'expiration
   - Conservation du rôle
   - Nouveau token généré

4. **Révocation**
   - Blacklist Redis
   - Déconnexion forcée
   - Nettoyage automatique

### Protection des Routes

#### Frontend
```typescript
// Middleware de protection des routes
export function withAuth(Component: React.ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/connexion');
      }
    }, [user, isLoading]);

    if (isLoading) return <Loading />;
    if (!user) return null;
    
    return <Component {...props} />;
  };
}

// Exemple d'utilisation
export default function AdminPage() {
  const { user } = useAuth();
  if (!user || user.role !== 'ADMIN') return <AccessDenied />;
  return <AdminDashboard />;
}
```

#### Backend
```typescript
// Middleware de vérification du token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Token manquant');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Non autorisé' });
  }
};

// Protection des routes admin
app.use('/api/admin/*', authenticateToken, requireAdmin);
```

## Validation des Données

### Frontend
1. **Formulaires**
   ```typescript
   const loginSchema = z.object({
     email: z.string().email('Email invalide'),
     password: z.string().min(8, 'Minimum 8 caractères')
   });
   ```

2. **Types TypeScript**
   ```typescript
   interface User {
     id: string;
     email: string;
     role: 'ADMIN' | 'PATISSIER' | 'USER';
     name: string;
   }
   ```

3. **Sanitization**
   - XSS prevention
   - Input escaping
   - HTML sanitization

### Backend
1. **Express Validator**
   ```typescript
   const validateLogin = [
     body('email').isEmail(),
     body('password').isLength({ min: 8 })
   ];
   ```

2. **Prisma Schema**
   ```prisma
   model User {
     id        String   @id @default(uuid())
     email     String   @unique
     password  String
     role      Role     @default(USER)
     name      String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

3. **Validation Middleware**
   - Type checking
   - Schema validation
   - Custom rules

## Bonnes Pratiques

### Mots de passe
1. **Hashage**
   ```typescript
   const hashPassword = async (password: string) => {
     const salt = await bcrypt.genSalt(10);
     return bcrypt.hash(password, salt);
   };
   ```

2. **Règles**
   - Minimum 8 caractères
   - 1 majuscule minimum
   - 1 chiffre minimum
   - 1 caractère spécial
   - Pas de mots courants

3. **Stockage**
   - Jamais en clair
   - Salt unique
   - Hash bcrypt

### Headers de Sécurité
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: true,
  xssFilter: true
}));
```

### Base de données
1. **Requêtes Sécurisées**
   ```typescript
   // ✅ Sécurisé avec Prisma
   const user = await prisma.user.findUnique({
     where: { email }
   });

   // ❌ Vulnérable aux injections SQL
   const user = await db.query(
     `SELECT * FROM users WHERE email = '${email}'`
   );
   ```

2. **Transactions**
   ```typescript
   await prisma.$transaction(async (tx) => {
     // Opérations atomiques
   });
   ```

3. **Logging**
   - Requêtes sensibles
   - Modifications
   - Erreurs

## Audit de Sécurité

### Points à vérifier
1. **Configuration**
   - Variables d'environnement
   - Clés de chiffrement
   - Configurations serveur

2. **Authentication**
   - Gestion des tokens
   - Protection des routes
   - Validation des rôles

3. **Data Security**
   - Validation entrées
   - Sanitization
   - Encryption

4. **Infrastructure**
   - Firewall
   - HTTPS
   - Rate limiting

### Outils recommandés
1. **Analyse Statique**
   - ESLint security
   - SonarQube
   - CodeQL

2. **Tests Dynamiques**
   - OWASP ZAP
   - Burp Suite
   - Penetration testing

3. **Monitoring**
   - Logs sécurité
   - Alertes
   - Audit trail

## Signalement de Failles

### Procédure
1. **Découverte**
   - Ne pas exploiter
   - Documenter précisément
   - Informer immédiatement

2. **Report**
   - Contact sécurisé
   - Description détaillée
   - Preuve de concept

3. **Suivi**
   - Accusé réception
   - Investigation
   - Correction
   - Disclosure responsable 