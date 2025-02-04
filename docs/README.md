# Le Monde Sucré de Linda - Documentation

## Description
Blog de pâtisserie permettant de partager des recettes, des astuces et des articles sur l'art de la pâtisserie. Une plateforme pour les passionnés de pâtisserie souhaitant découvrir et échanger autour de recettes artisanales.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Installation
1. Cloner le projet
```bash
git clone https://github.com/votre-username/le-monde-sucre-de-linda.git
cd le-monde-sucre-de-linda
```

2. Frontend (port 3000)
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

3. Backend (port 3001)
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## 📚 Documentation

### Pour les Développeurs
- [Guide Technique](./TECHNICAL.md) - Architecture et stack technique
- [API](./API.md) - Documentation des endpoints
- [Sécurité](./SECURITY.md) - Mesures et configurations

### Contribution
- [Guide de Contribution](./CONTRIBUTING.md) - Comment contribuer
- [Changelog](./CHANGELOG.md) - Historique des versions

## 🔧 État Actuel (04/02/2024)

### Implémenté ✅
- Authentification de base (login/register)
- Protection des routes par middleware
- Structure de base du projet (frontend/backend)
- Configuration initiale des tests
- Tests E2E avec Cypress (100% de réussite)

### En Développement 🚧
- Système de gestion des articles et recettes
- Interface d'administration pour la gestion du contenu
- Tests d'intégration des API (80% complétés)
- Système de commentaires et interactions
- Optimisation des performances

### Métriques de Qualité 📊
- Coverage des tests : 83% (objectif : 90%)
- Performance Lighthouse : 85+

## 📝 Notes
- Node.js 18+ requis
- PostgreSQL requis pour la base de données
- Variables d'environnement à configurer

## Support
Pour toute question : support@lemondesucre.fr

## Table des Matières

1. [API](API.md) - Description des endpoints et de la structure de l'API.
2. [Tests](TESTING.md) - Guide pour exécuter et rédiger des tests (unitaires, intégration, E2E).
3. [Performance](PERFORMANCE.md) - Optimisations et métriques de performance.
4. [Sécurité](SECURITY.md) - Politiques de sécurité et bonnes pratiques.
5. [Administration](ADMIN_IMPLEMENTATION.md) - Guide d'implémentation de l'administration.
6. [Contribution](CONTRIBUTING.md) - Règles et processus pour contribuer au projet.
7. [Changelog](CHANGELOG.md) - Historique des changements du projet.
8. [Dépannage](TROUBLESHOOTING.md) - Solutions aux problèmes connus.
9. [TODO](TODO.md) - Liste des tâches en cours et à venir.
10. [Scénarios de Test](TEST_SCENARIOS.md) - Cas de test pour vérifier les fonctionnalités.
11. [Documentation Technique](TECHNICAL.md) - Vue d'ensemble technique et architecture.

## Guide Rapide

- Pour toute contribution, référez-vous à [CONTRIBUTING.md](CONTRIBUTING.md).
- Pour connaître les modifications récentes, consultez le [Changelog](CHANGELOG.md).
- Pour tout problème ou question, reportez-vous à [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Remarques

La documentation est régulièrement mise à jour pour refléter l'état actuel du projet. Merci de contribuer si vous constatez des informations périmées.

## 📊 État Actuel (2025-02-02)

### Tests et Qualité
- Tests E2E (Cypress) : ✅ 100% des tests passent
  - Tests d'Accessibilité : 5/5 passés
  - Tests d'Interactions : 5/5 passés
- Tests d'intégration : 🔄 En cours d'optimisation
  - Auth Service : Tests en cours de stabilisation
  - API Endpoints : Couverture à améliorer
- Tests Unitaires : ⚠️ Couverture insuffisante
  - Couverture globale : 0.58%
  - Objectif : 70%

### Performance API
- Login : ~37ms (objectif < 500ms)
- Register : ~12ms (objectif < 800ms)
- GET /me : ~9ms (objectif < 200ms)
- Taux de cache : > 90% pour les endpoints fréquents

### Points d'Attention
1. Tests d'intégration du service d'authentification à stabiliser
   - Gestion des erreurs à améliorer
   - Tests de timeout à optimiser
   - Validation des entrées à renforcer
2. Tests unitaires à implémenter en priorité
3. Documentation technique à maintenir à jour

## 📚 Documentation Disponible

- [Guide des Tests](./TESTING.md)
- [API Reference](./API.md)
- [Performance](./PERFORMANCE.md)
- [Sécurité](./SECURITY.md)
- [Scénarios de Test](./TEST_SCENARIOS.md)
- [Dépannage](./TROUBLESHOOTING.md)
- [TODO List](./TODO.md)
- [Changelog](./CHANGELOG.md)
- [Composants UI](./UI_COMPONENTS.md)

## 🎯 Prochaines Étapes

1. Stabilisation des Tests
   - Correction des tests d'authentification
   - Amélioration de la gestion des erreurs
   - Optimisation des timeouts

2. Augmentation de la Couverture
   - Implémentation des tests unitaires
   - Tests des composants UI
   - Tests des services API

3. Documentation
   - Mise à jour continue
   - Documentation des nouveaux tests
   - Guide de dépannage enrichi

## Documentation Associée
- [Performance](./PERFORMANCE.md) - Détails des tests de performance
- [Tests](./TESTING.md) - Guide complet des tests
- [Sécurité](./SECURITY.md) - Mesures de sécurité
- [API](./API.md) - Documentation API
- [Dépannage](./TROUBLESHOOTING.md) - Guide de résolution des problèmes

## Prochaines Étapes
1. Améliorer la couverture de code (objectif : 70%)
2. Optimiser les performances des tests d'inscription
3. Implémenter des tests E2E supplémentaires
4. Renforcer la surveillance des métriques de performance

## Problèmes Connus
- Couverture de code insuffisante
- Quelques avertissements TypeScript à résoudre
- Tests d'inscription à optimiser

## Améliorations Récentes
- ✅ Tests de connexion stabilisés
- ✅ Gestion des erreurs réseau améliorée
- ✅ Tests de session implémentés
- ✅ Tests de rôles optimisés
- ✅ Validation des entrées renforcée
- ✅ Scénarios complexes d'authentification ajoutés

## Table des Matières

### Sécurité et Authentification
- [Guide de Sécurité](./SECURITY.md)
- [Documentation API](./API.md)
- [Guide de Dépannage](./TROUBLESHOOTING.md)

### Performance et Monitoring
- [Métriques et Performance](./PERFORMANCE.md)

### Interface Utilisateur
- [Guide des Composants UI](./UI_COMPONENTS.md)
- [Guides de Style](./UI_COMPONENTS.md#styles-et-thème)
- [Composants Réutilisables](./UI_COMPONENTS.md#composants-communs)

### Guides Développeur
- [Guide d'Installation](./INSTALLATION.md)
- [Guide de Contribution](./CONTRIBUTING.md)
- [Standards de Code](./CODE_STANDARDS.md)

## Liens Rapides

- [Dépannage](./TROUBLESHOOTING.md)
- [Changelog](./CHANGELOG.md)
- [Support](./SUPPORT.md)

## Contact

Pour toute question ou support :
- Email : support@lemondesucre.fr
- Discord : [Rejoindre le serveur](https://discord.gg/lemondesucre)
- GitHub : [Signaler un problème](https://github.com/lemondesucre/issues)

## Index des Documents

### API et Authentification
- [Documentation API](./API.md)
  - Endpoints d'authentification
  - Codes d'erreur
  - Exemples d'utilisation
  - Métriques de performance

### Guides et Support
- [Guide de Dépannage](./TROUBLESHOOTING.md)
  - Résolution des erreurs courantes
  - Logs et debugging
  - Contact support
- [Guide de Sécurité](./SECURITY.md)
  - Protection des routes
  - Validation des données
  - Bonnes pratiques
- [Métriques et Performance](./PERFORMANCE.md)
  - Temps de réponse
  - Optimisations
  - Monitoring

### Suivi du Projet
- [TODO List](./TODO.md)
  - Priorités actuelles
  - Tâches en cours
  - Fonctionnalités complétées

### Versions
- [Changelog](./CHANGELOG.md)
  - Historique des versions
  - Nouvelles fonctionnalités
  - Corrections de bugs

## Démarrage Rapide

1. Installation :
   ```bash
   npm install
   ```

2. Configuration :
   - Copier `.env.example` vers `.env` dans le dossier backend
   - Copier `.env.example` vers `.env.local` dans le dossier frontend

3. Lancer le projet :
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

## Comptes de Test

### Admin
- Email: admin@test.com
- Mot de passe: Admin123!

### Pâtissier
- Email: patissier@test.com
- Mot de passe: Patissier123!

### Utilisateur Standard
- Email: user@test.com
- Mot de passe: User123!

## Structure du Projet

```
le-monde-sucre-de-linda/
├── docs/               # Documentation
│   ├── API.md         # Documentation API
│   ├── SECURITY.md    # Guide de sécurité
│   ├── PERFORMANCE.md # Métriques et performance
│   └── TROUBLESHOOTING.md # Guide de dépannage
├── frontend/          # Application Next.js
└── backend/           # API Node.js/Express
```

## Workflow de Développement

1. Créer une branche pour la fonctionnalité
2. Développer et tester localement
3. Exécuter les tests
4. Créer une Pull Request
5. Review du code
6. Merge après validation

## Signalement de Bugs

1. Vérifier les logs
2. Consulter la documentation
3. Créer une issue détaillée
4. Ajouter les labels appropriés

## Support

Pour toute question ou assistance :
1. Consulter la documentation
2. Vérifier les issues existantes
3. Créer une nouvelle issue si nécessaire 

## Prochaines Étapes
1. Implémenter et renforcer les tests pour les composants UI.
2. Améliorer la couverture des branches des tests d'intégration.
3. Mettre en place un monitoring des performances pour identifier rapidement toute régression.
4. Continuer l'optimisation des endpoints critiques.

## État Actuel du Projet (04/02/2024)

### Fonctionnalités Implémentées ✅
- Authentification de base (login/register)
- Routes protégées par middleware
- Structure de base du frontend (Next.js) et backend (Express)
- Configuration initiale des tests

### En Développement 🚧
- Système complet de gestion des articles et recettes
- Interface d'administration
- Système de commentaires
- Tests d'intégration

## Documentation Technique

### Frontend (Next.js 14)
- [Configuration](./TECHNICAL.md) - Architecture et setup
- [Tests](./TESTING.md) - Guide des tests
- [Performance](./PERFORMANCE.md) - Optimisations

### Backend (Express + TypeScript)
- [API](./API.md) - Documentation des endpoints
- [Sécurité](./SECURITY.md) - Authentification et protection
- [Tests](./TESTING.md#backend) - Tests backend

### Guides
- [Contribution](./CONTRIBUTING.md) - Comment contribuer
- [Dépannage](./TROUBLESHOOTING.md) - Résolution des problèmes
- [TODO](./TODO.md) - Tâches en cours et planifiées

## Installation Rapide

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Contact
Pour toute question : support@lemondesucre.fr

## 🔧 Dépannage

### Problèmes Courants

#### Installation
- **Erreur de dépendances** : Assurez-vous d'utiliser Node.js 18+
  ```bash
  node --version
  # Si besoin, mettez à jour Node.js
  ```

- **Erreur PostgreSQL** : Vérifiez que PostgreSQL est installé et en cours d'exécution
  ```bash
  # Windows
  net start postgresql-x64-14
  # Linux
  sudo service postgresql status
  ```

#### Développement
- **Le frontend ne se connecte pas à l'API** : 
  - Vérifiez que le backend est en cours d'exécution
  - Vérifiez les variables d'environnement dans `.env.local`
  - Vérifiez les ports (3000 pour frontend, 3001 pour backend)

- **Erreurs de compilation TypeScript** :
  ```bash
  # Nettoyez les caches
  npm run clean
  # Réinstallez les dépendances
  npm install
  ```

- **Erreurs de test** :
  - Vérifiez que la base de données de test est configurée
  - Assurez-vous que tous les fichiers .env nécessaires sont présents

### Logs et Debugging
- Frontend : Consultez la console du navigateur
- Backend : Consultez les logs dans la console ou `logs/`
- Base de données : Consultez les logs PostgreSQL

### Besoin d'Aide ?
- Consultez la documentation technique détaillée
- Ouvrez une issue sur GitHub
- Contactez le support : support@lemondesucre.fr