## Mise à Jour Récentes
Optimisation de la gestion du rôle USER : Le backend a été modifié pour charger l'utilisateur complet avec ses rôles via Prisma, améliorant ainsi la fiabilité des contrôles d'accès. Les tests d'intégration ont été ajustés pour garantir l'unicité des emails lors des inscriptions.

---

# 🔧 Guide de Dépannage
Mise à jour : 2024-02-01

## 🚨 Problèmes Courants

### 1. Tests d'Intégration

#### Problème : Gestion du Rôle USER
```typescript
// Erreur courante
Error: Le rôle USER est invalide
at src/services/authService.ts:54:12
```

**Solution :**
1. Vérifier la création du rôle dans `integration.setup.ts`
2. S'assurer que l'ID du rôle est cohérent
3. Nettoyer la base de test avant chaque suite

#### Problème : Couverture des Tests
```bash
# Erreur de couverture
ERROR: Coverage for branches (75.00%) does not meet global threshold (80%)
```

**Solution :**
1. Identifier les branches non couvertes
2. Ajouter des cas de test manquants
3. Vérifier les conditions limites

### 2. Performance API

#### Problème : Temps de Réponse Lents
```typescript
// Exemple de requête lente
const response = await fetch('/api/recipes?category=all');
// Temps > 500ms
```

**Solution :**
1. Implémenter le caching
2. Optimiser les requêtes SQL
3. Ajouter des index appropriés

#### Problème : Fuites Mémoire
```bash
# Warning de mémoire
WARN: Possible memory leak detected in AuthService
```

**Solution :**
1. Nettoyer les listeners
2. Fermer les connexions
3. Gérer les timeouts

### 3. Authentification

#### Problème : Validation JWT
```typescript
// Erreur de token
Error: jwt malformed
at verifyToken (src/middleware/auth.ts:25:8)
```

**Solution :**
1. Vérifier le format du token
2. Valider la clé secrète
3. Contrôler l'expiration

#### Problème : Sessions
```typescript
// Erreur de session
Error: Session expired or invalid
```

**Solution :**
1. Vérifier les paramètres de session
2. Implémenter le refresh token
3. Nettoyer les sessions expirées

## 🔧 Outils de Diagnostic

### Logs
```bash
# Activer les logs détaillés
DEBUG=app:* npm start

# Filtrer les logs d'authentification
grep "auth" logs/app.log
```

### Tests
```bash
# Exécuter les tests avec debug
DEBUG=test:* npm test

# Tests spécifiques
npm test -- auth.test.ts
```

### Performance
```bash
# Profiling
node --prof app.js

# Analyse mémoire
node --inspect app.js
```

## 📊 Métriques à Surveiller

### Performance
- Temps de réponse API > 100ms
- Utilisation mémoire > 80%
- CPU > 70%

### Sécurité
- Tentatives de connexion échouées
- Tokens invalides
- Requêtes bloquées

### Base de Données
- Temps de requête > 50ms
- Connexions actives > 80%
- Erreurs de transaction

## 🔍 Procédures de Debug

### 1. Tests
1. Isoler le test qui échoue
2. Vérifier l'environnement
3. Analyser les logs
4. Reproduire localement

### 2. Performance
1. Identifier le goulot d'étranglement
2. Profiler l'application
3. Optimiser le code
4. Valider les améliorations

### 3. Sécurité
1. Vérifier les logs
2. Analyser les patterns
3. Renforcer les contrôles
4. Tester les corrections

## 🛠️ Maintenance Préventive

### Quotidien
- Vérifier les logs
- Monitorer les performances
- Nettoyer les sessions

### Hebdomadaire
- Analyser les métriques
- Mettre à jour les dépendances
- Sauvegarder les données

### Mensuel
- Audit de sécurité
- Revue de code
- Optimisation base de données

## 📝 Documentation

### Logs
- Format : `[LEVEL] [SERVICE] Message`
- Rotation : Quotidienne
- Rétention : 30 jours

### Métriques
- Collection : Toutes les 5 minutes
- Agrégation : Horaire
- Stockage : 90 jours

### Alertes
- Sévérité : INFO, WARN, ERROR
- Notification : Email, Slack
- Escalade : Auto après 30 minutes

## 🔄 Processus de Mise à Jour

### Avant
1. Sauvegarder les données
2. Vérifier les dépendances
3. Tester en staging

### Pendant
1. Appliquer les migrations
2. Mettre à jour le code
3. Vérifier les services

### Après
1. Valider les fonctionnalités
2. Vérifier les métriques
3. Monitorer les erreurs

## 📞 Support

### Contact
- Email : support@lemondesucre.fr
- Urgence : +33 1 23 45 67 89
- Slack : #support-technique

### Horaires
- Lundi-Vendredi : 9h-18h
- Weekend : Urgences uniquement
- Astreinte : 24/7

## 🔍 Diagnostic

### Commandes Utiles

#### Tests
```bash
# Tests complets
npm test

# Tests spécifiques
npm test auth
npm test perf
npm test mixed

# Couverture
npm run test:coverage
```

#### Performance
```bash
# Analyse des performances
npm run analyze:perf

# Monitoring en temps réel
npm run monitor:perf

# Tests de charge
npm run test:load
```

#### Sécurité
```bash
# Vérification des vulnérabilités
npm audit

# Scan de sécurité
npm run security:scan

# Analyse des logs
npm run logs:security
```

## 🚦 Codes d'Erreur

### API
- `401` : Token invalide/expiré
- `403` : Accès non autorisé
- `429` : Rate limit dépassé
- `500` : Erreur serveur

### Tests
- `FAIL` : Test échoué
- `TIMEOUT` : Délai dépassé
- `ERROR` : Erreur d'exécution

## 📝 Logs

### Emplacement des Logs
```text
/logs/
  ├── test/
  │   ├── unit.log
  │   ├── perf.log
  │   └── security.log
  ├── api/
  │   ├── access.log
  │   └── error.log
  └── security/
      ├── auth.log
      └── audit.log
```

### Niveaux de Log
- `ERROR` : Erreur critique
- `WARN` : Avertissement
- `INFO` : Information
- `DEBUG` : Débogage

## 🔄 Procédures de Recovery

### 1. Échec des Tests
1. Vérifier les logs
2. Isoler le test problématique
3. Relancer avec plus de verbosité
4. Corriger et retester

### 2. Problèmes de Performance
1. Analyser les métriques
2. Vérifier le cache
3. Optimiser si nécessaire
4. Retester sous charge

### 3. Problèmes de Sécurité
1. Vérifier les logs de sécurité
2. Identifier la source
3. Appliquer les correctifs
4. Valider les changements

## 📞 Support

### Contact
- Email : support@lemondesucre.fr
- Discord : [Serveur Support](https://discord.gg/lemondesucre)
- GitHub : [Issues](https://github.com/lemondesucre/issues)

### Documentation
- [Guide des Tests](./TESTING.md)
- [Guide de Sécurité](./SECURITY.md)
- [Documentation API](./API.md)

## 🚨 Problèmes Courants (2025-02-02)

### Tests d'Authentification

#### 1. Tests de Timeout Instables
**Problème** : Les tests de timeout échouent de manière aléatoire.
**Solution** :
1. Augmenter les timeouts dans les tests :
```typescript
await waitFor(() => {
  expect(screen.getByTestId('error-message'))
    .toHaveTextContent('Délai d\'attente dépassé');
}, { timeout: 10000 });
```
2. Utiliser `jest.useFakeTimers()` pour contrôler le temps
3. Implémenter des retries pour les tests instables

#### 2. Tests de Session Expirée
**Problème** : Les tests de session ne gèrent pas correctement l'expiration.
**Solution** :
1. Mocker correctement getCurrentUser :
```typescript
(getCurrentUser as jest.Mock).mockRejectedValueOnce(
  new Error('expired')
);
```
2. Vérifier la redirection :
```typescript
await waitFor(() => {
  expect(window.location.pathname).toBe('/connexion');
});
```

#### 3. Erreurs de Validation
**Problème** : Les messages d'erreur ne sont pas trouvés dans le DOM.
**Solution** :
1. Attendre le rendu complet :
```typescript
await waitFor(() => {
  expect(screen.getByTestId('error-message'))
    .toBeInTheDocument();
});
```
2. Vérifier la structure du composant
3. Utiliser les bons data-testid

### Performance

#### 1. First Contentful Paint Lent
**Problème** : FCP > 2s sur mobile
**Solution** :
1. Optimiser les images avec next/image
2. Implémenter le lazy loading
3. Réduire la taille du bundle JS
4. Utiliser le Critical CSS

#### 2. Temps de Réponse API
**Problème** : Latence élevée sous charge
**Solution** :
1. Optimiser les requêtes DB
2. Implémenter le caching
3. Utiliser le connection pooling
4. Configurer le rate limiting

### Sécurité

#### 1. Tests d'Injection SQL
**Problème** : Détection des injections incomplète
**Solution** :
1. Utiliser des paramètres préparés
2. Valider toutes les entrées
3. Échapper les caractères spéciaux
4. Tester les cas limites

#### 2. Validation des Sessions
**Problème** : Sessions non invalidées correctement
**Solution** :
1. Vérifier les tokens JWT
2. Implémenter la rotation des tokens
3. Gérer la révocation
4. Logger les tentatives suspectes

## 🔍 Debugging

### Tests

#### 1. Logs de Test
```bash
# Afficher les logs détaillés
npm test -- --verbose

# Debug d'un test spécifique
npm test -- auth.test.ts --debug
```

#### 2. Jest Debug Config
```json
{
  "jest": {
    "verbose": true,
    "testTimeout": 10000,
    "setupFilesAfterEnv": [
      "<rootDir>/src/__tests__/setup.ts"
    ]
  }
}
```

### Performance

#### 1. Profiling
```bash
# Profiling Frontend
npm run build && npm run analyze

# Profiling API
npm run profile:api
```

#### 2. Monitoring
```bash
# Logs API
npm run logs:api

# Métriques Performance
npm run metrics
```

## 📊 Métriques à Surveiller

### Tests
- Taux de réussite des tests
- Temps d'exécution des tests
- Couverture de code
- Tests instables

### Performance
- First Contentful Paint
- Time to Interactive
- API Response Time
- Bundle Size

### Sécurité
- Tentatives de force brute
- Injections SQL
- Sessions invalides
- Rate limit violations

## 🚀 Solutions Rapides

### Tests Instables
1. Augmenter les timeouts
2. Implémenter des retries
3. Isoler les tests
4. Nettoyer l'état

### Performance Lente
1. Optimiser les images
2. Réduire le bundle
3. Améliorer le caching
4. Optimiser les requêtes

### Erreurs de Sécurité
1. Valider les entrées
2. Gérer les sessions
3. Configurer les headers
4. Logger les erreurs

## 📝 Bonnes Pratiques

### Tests
1. Tests isolés
2. Setup/Teardown propre
3. Assertions claires
4. Timeouts appropriés

### Performance
1. Optimisation des assets
2. Caching efficace
3. Code splitting
4. Lazy loading

### Sécurité
1. Validation stricte
2. Tokens sécurisés
3. Rate limiting
4. Logging complet

## 🔄 Processus de Debug

### 1. Identification
- Reproduire le problème
- Collecter les logs
- Identifier le contexte
- Noter les étapes

### 2. Analyse
- Examiner les logs
- Vérifier les métriques
- Tester les hypothèses
- Isoler la cause

### 3. Résolution
- Appliquer la solution
- Tester la correction
- Vérifier les effets
- Documenter la solution

### 4. Prévention
- Mettre à jour les tests
- Améliorer le monitoring
- Documenter les leçons
- Former l'équipe 

# Guide de Dépannage

## État Actuel (02/02/2024)

### 🔍 Problèmes Courants et Solutions

#### Authentification
1. **Erreur "Token expiré"**
   ```
   Solution : Déconnexion/reconnexion ou rafraîchissement du token
   Prévention : Vérifier la validité du token avant les requêtes
   ```

2. **Problèmes de Session**
   ```
   Solution : Nettoyer le localStorage et les cookies
   Prévention : Implémenter une gestion robuste des sessions
   ```

3. **Erreurs de Validation**
   ```
   Solution : Vérifier le format des données envoyées
   Prévention : Validation côté client et serveur
   ```

#### Performance
1. **Temps de Chargement Lents**
   ```
   Solution : 
   - Vérifier le cache
   - Optimiser les images
   - Réduire les requêtes API
   ```

2. **Problèmes de Cache**
   ```
   Solution :
   - Vider le cache Redis
   - Vérifier les configurations
   - Réinitialiser les stratégies
   ```

3. **Erreurs API**
   ```
   Solution :
   - Vérifier les logs serveur
   - Tester les endpoints
   - Valider les paramètres
   ```

### 🛠️ Outils de Diagnostic

#### Logs
```typescript
// Configuration des logs
const logger = {
  error: (message: string, meta?: object) => {
    console.error({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      ...meta
    });
  },
  
  warn: (message: string, meta?: object) => {
    console.warn({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...meta
    });
  }
};
```

#### Monitoring
```typescript
// Middleware de monitoring
const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request', {
      path: req.path,
      method: req.method,
      duration,
      status: res.statusCode
    });
  });
  
  next();
};
```

### 📋 Procédures de Dépannage

#### 1. Problèmes d'Authentification
1. Vérifier les logs d'erreur
2. Tester la validité du token
3. Vérifier les permissions
4. Valider la configuration

#### 2. Problèmes de Performance
1. Analyser les métriques
2. Vérifier le cache
3. Optimiser les requêtes
4. Tester la charge

#### 3. Erreurs API
1. Vérifier la connexion
2. Valider les paramètres
3. Tester les endpoints
4. Analyser les logs

### 🔄 Maintenance Préventive

#### Quotidienne
- Vérification des logs
- Monitoring des erreurs
- Analyse des performances
- Vérification du cache

#### Hebdomadaire
- Nettoyage des sessions
- Optimisation du cache
- Analyse des tendances
- Revue des erreurs

#### Mensuelle
- Audit complet
- Optimisation générale
- Mise à jour documentation
- Test de charge

## Contact Support

### Équipe Technique
- Email : support@lemondesucre.fr
- Discord : [Serveur Support](https://discord.gg/lemondesucre)
- GitHub : [Issues](https://github.com/lemondesucre/issues)

### Procédure d'Escalade
1. Vérifier la documentation
2. Consulter les issues GitHub
3. Contacter le support Discord
4. Escalader par email 

## 🔄 Solutions de Tests (Mise à jour 02/02/2024)

### Tests d'Authentification Optimisés

#### 1. Gestion des Timeouts
```typescript
// Configuration des timeouts
jest.setTimeout(10000);
beforeAll(() => {
  // Configuration spécifique pour les tests d'auth
  process.env.NEXT_PUBLIC_API_TIMEOUT = '5000';
});
```

#### 2. Tests de Session
```typescript
// Test helper pour la gestion des sessions
const simulateSessionExpiry = async () => {
  // Nettoyer la session
  localStorage.clear();
  sessionStorage.clear();
  // Attendre la redirection
  await waitFor(() => {
    expect(window.location.pathname).toBe('/login');
  });
};
```

#### 3. Stabilité des Tests
```typescript
// Configuration pour tests stables
const setupStableTest = () => {
  // Désactiver le mode strict pour les tests
  process.env.NEXT_STRICT_MODE = 'false';
  // Configurer les timeouts appropriés
  jest.setTimeout(30000);
};
``` 