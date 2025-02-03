# 🧪 Tests - Le Monde Sucré de Linda

Ce dossier contient tous les tests du projet, organisés de manière structurée pour une meilleure maintenabilité et lisibilité.

## 📁 Structure des Dossiers

```
tests/
├── unit/                   # Tests unitaires
│   ├── components/        # Tests des composants React
│   ├── hooks/            # Tests des hooks personnalisés
│   ├── services/         # Tests des services
│   ├── utils/            # Tests des utilitaires
│   ├── frontend/         # Tests spécifiques au frontend
│   └── backend/          # Tests spécifiques au backend
│
├── integration/           # Tests d'intégration
│   ├── auth/            # Tests d'authentification
│   └── features/        # Tests des fonctionnalités
│
├── api/                  # Tests API
│   ├── auth/            # Tests API d'authentification
│   └── endpoints/       # Tests des endpoints
│
├── e2e/                  # Tests End-to-End (Cypress)
│
├── setup/               # Configuration des tests
│   └── jest/           # Configuration Jest
│
├── utils/              # Utilitaires partagés pour les tests
│   ├── mocks/         # Mocks et fixtures
│   └── helpers/       # Fonctions d'aide aux tests
│
└── mocks/              # Mocks globaux
```

## 📊 Couverture des Tests

Les rapports de couverture sont générés à la racine du projet dans le dossier `/coverage`. Ce dossier contient :

```
/coverage                    # À la racine du projet (pas dans /tests)
├── index.html              # Interface web interactive
├── lcov.info               # Rapport détaillé format LCOV
├── clover.xml              # Rapport format XML
└── lcov-report/           # Rapports HTML détaillés
```

**Important** :
- Le dossier `coverage` est généré automatiquement par `npm run test:coverage`
- Il ne doit PAS être versionné (inclus dans `.gitignore`)
- Il est utilisé par les outils CI/CD pour l'analyse de couverture
- Objectif de couverture : >80% du code

## 🚀 Scripts Disponibles

```bash
# Lancer tous les tests
npm run test:all

# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests API
npm run test:api

# Tests E2E
npm run test:e2e
npm run test:e2e:open  # Ouvre Cypress

# Couverture des tests
npm run test:coverage   # Génère les rapports dans /coverage
```

## 📝 Conventions de Nommage

- Tests unitaires : `*.test.ts(x)`
- Tests d'intégration : `*.integration.test.ts(x)`
- Tests API : `*.api.test.ts`
- Tests E2E : `*.spec.ts` (Cypress)

## 🔍 Bonnes Pratiques

1. **Organisation**
   - Un fichier de test par composant/service
   - Regrouper les tests connexes dans des sous-dossiers
   - Utiliser les utilitaires partagés du dossier `utils`

2. **Documentation**
   - Chaque suite de tests doit avoir une description claire
   - Documenter les cas de test complexes
   - Utiliser des noms explicites pour les tests

3. **Performance**
   - Éviter les tests redondants
   - Utiliser les mocks appropriés
   - Optimiser les tests lents

4. **Couverture**
   - Viser une couverture de code > 80%
   - Tester les cas d'erreur
   - Vérifier la couverture avec `npm run test:coverage`
   - Analyser régulièrement les rapports dans `/coverage`

## 📚 Documentation Associée

- [Guide des Tests](../docs/TESTING.md)
- [Guide Technique](../docs/TECHNICAL.md)
- [Guide de Contribution](../docs/CONTRIBUTING.md) 