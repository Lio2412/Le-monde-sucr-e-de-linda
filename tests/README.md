# 🧪 Tests - Le Monde Sucré de Linda

Ce dossier contient tous les tests du projet, organisés de manière structurée pour une meilleure maintenabilité et lisibilité.

## 📁 Structure des Dossiers

```
tests/
├── e2e/                    # Tests End-to-End (Cypress)
│   ├── auth/              # Tests d'authentification
│   ├── features/          # Tests des fonctionnalités
│   ├── integration/       # Tests d'intégration
│   └── performance/       # Tests de performance
│
├── unit/                  # Tests unitaires
│   ├── components/        # Tests des composants React
│   ├── hooks/            # Tests des hooks personnalisés
│   ├── utils/            # Tests des utilitaires
│   └── services/         # Tests des services
│
├── api/                   # Tests API
│   ├── auth/             # Tests API d'authentification
│   ├── recipes/          # Tests API des recettes
│   └── users/            # Tests API des utilisateurs
│
└── setup/                # Configuration des tests
    ├── jest.setup.js     # Configuration Jest
    ├── cypress.config.js # Configuration Cypress
    └── mocks/           # Mocks et fixtures
```

## 🚀 Commandes

```bash
# Lancer tous les tests
npm run test:all

# Tests E2E (Cypress)
npm run test:e2e

# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests de performance
npm run test:performance

# Vérifier la couverture
npm run test:coverage
```

## 📝 Conventions de Nommage

1. **Tests E2E (Cypress)**
   - Fichiers : `*.cy.ts`
   - Exemple : `login.cy.ts`

2. **Tests Unitaires**
   - Fichiers : `*.test.ts(x)`
   - Exemple : `Button.test.tsx`

3. **Tests d'Intégration**
   - Fichiers : `*.integration.test.ts`
   - Exemple : `auth.integration.test.ts`

## 🎯 Bonnes Pratiques

1. **Organisation des Tests**
   - Un fichier de test par composant/service
   - Regrouper les tests connexes dans des sous-dossiers
   - Utiliser des fixtures pour les données de test

2. **Documentation**
   - Chaque suite de tests doit avoir une description claire
   - Les cas de test complexes doivent être documentés
   - Les mocks et fixtures doivent être documentés

3. **Performance**
   - Éviter les tests redondants
   - Utiliser des mocks pour les appels API
   - Optimiser les tests lents

## 🔍 Couverture de Code

- Objectif global : 80%
- Couverture minimale par fichier : 70%
- Vérifier la couverture avec `npm run test:coverage`

## 🐛 Déboggage

1. **Tests E2E**
   - Utiliser `cy.debug()` pour le débogage
   - Activer les screenshots avec `screenshotOnFailure: true`
   - Consulter les logs dans `cypress/logs`

2. **Tests Unitaires**
   - Utiliser `console.log` avec parcimonie
   - Préférer les assertions Jest détaillées
   - Utiliser le debugger de VS Code

## 📚 Documentation Supplémentaire

- [Guide des Tests](../docs/TESTING.md)
- [Scénarios de Test](../docs/TEST_SCENARIOS.md)
- [Guide de Dépannage](../docs/TROUBLESHOOTING.md) 