# 🧪 Tests et Qualité

## Tests Unitaires

### Frontend
```typescript
// Exemple de test pour le hook useAuth
describe('useAuth', () => {
  it('devrait gérer la connexion avec succès', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });
    expect(result.current.user).toBeDefined();
  });
});
```

### Backend
```typescript
// Test du service d'authentification
describe('AuthService', () => {
  it('devrait retourner une erreur si email incorrect', async () => {
    await expect(
      authService.login('invalid@test.com', 'password')
    ).rejects.toThrow('Email ou mot de passe incorrect');
  });
});
```

## Tests d'Intégration

### API
```typescript
describe('Auth API', () => {
  it('POST /api/auth/login - succès', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password'
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
```

### Base de données
```typescript
describe('User Repository', () => {
  it('devrait créer un nouvel utilisateur', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: await hashPassword('password')
      }
    });
    expect(user.id).toBeDefined();
  });
});
```

## Tests End-to-End

### Scénarios Cypress
```typescript
describe('Authentification', () => {
  it('devrait permettre la connexion', () => {
    cy.visit('/connexion');
    cy.get('[data-testid="email"]').type('admin@test.com');
    cy.get('[data-testid="password"]').type('Admin123!');
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Tests de Performance
```typescript
describe('Performance API', () => {
  it('devrait répondre en moins de 100ms', async () => {
    const start = Date.now();
    await request(app).get('/api/auth/me');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
```

## Qualité du Code

### Linting
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Prettier
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Couverture de Tests

### Objectifs
- Tests unitaires : > 80%
- Tests d'intégration : > 70%
- Tests E2E : Scénarios critiques couverts
- Snapshots : Composants UI principaux

### Métriques Actuelles
```text
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   85.53 |    79.31 |   83.92 |   85.53 |
 src/                 |   88.24 |    83.33 |   85.71 |   88.24 |
  auth/               |   92.31 |    85.71 |   88.89 |   92.31 |
  users/              |   83.33 |    75.00 |   80.00 |   83.33 |
----------------------|---------|----------|---------|---------|
```

## CI/CD

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

### Hooks Git
```bash
#!/bin/sh
npm run lint && npm run test
```

## Monitoring

### Sentry
```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});
```

### Datadog
```typescript
const tracer = require('dd-trace').init({
  service: 'le-monde-sucre-de-linda',
  env: process.env.NODE_ENV
});
```

## Bonnes Pratiques

### Tests
1. **Nommage**
   - Descriptif et clair
   - Format "devrait faire quelque chose"
   - Groupement logique

2. **Organisation**
   - Un fichier de test par module
   - Setup et teardown appropriés
   - Isolation des tests

3. **Assertions**
   - Précises et ciblées
   - Messages d'erreur clairs
   - Éviter les tests fragiles

### Qualité
1. **Code**
   - DRY (Don't Repeat Yourself)
   - SOLID principles
   - Clean Code guidelines

2. **Documentation**
   - JSDoc pour les fonctions
   - README à jour
   - Commentaires pertinents

3. **Revue**
   - Pull requests
   - Code review
   - Pair programming 