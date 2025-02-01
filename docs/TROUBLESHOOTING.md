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