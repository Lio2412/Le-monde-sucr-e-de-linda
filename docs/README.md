# 📚 Documentation Le Monde Sucré de Linda

## ⚠️ État Actuel du Projet

### 🚨 Problèmes Connus
- Erreur d'import authService dans useAuth.ts
- Pics de latence occasionnels sur GET /me
- Warnings de compilation Next.js

### 📊 Métriques
- **API Performance**:
  - Login: ~51ms (max 173ms)
  - GET /me: ~3ms (max 274ms)
  - Register: ~2ms
- **Cache**: 95% hit rate sur GET /me
- **Taille des Réponses**:
  - Login: 1266 bytes
  - User Info: 1054 bytes

## Table des Matières

### 🔐 Sécurité et Authentification
- [Guide de Sécurité](./SECURITY.md)
- [Documentation API](./API.md)
- [Guide de Dépannage](./TROUBLESHOOTING.md)

### 📊 Performance et Monitoring
- [Métriques et Performance](./PERFORMANCE.md)

### 📱 Interface Utilisateur
- [Guide des Composants UI](./UI_COMPONENTS.md)
- [Guides de Style](./UI_COMPONENTS.md#styles-et-thème)
- [Composants Réutilisables](./UI_COMPONENTS.md#composants-communs)

### 🛠️ Guides Développeur
- [Guide d'Installation](./INSTALLATION.md)
- [Guide de Contribution](./CONTRIBUTING.md)
- [Standards de Code](./CODE_STANDARDS.md)

## Liens Rapides

- [🔧 Dépannage](./TROUBLESHOOTING.md)
- [📝 Changelog](./CHANGELOG.md)
- [📞 Support](./SUPPORT.md)

## Contact

Pour toute question ou support :
- Email : support@lemondesucre.fr
- Discord : [Rejoindre le serveur](https://discord.gg/lemondesucre)
- GitHub : [Signaler un problème](https://github.com/lemondesucre/issues)

## 📚 Index des Documents

### 🔒 API et Authentification
- [Documentation API](./API.md)
  - Endpoints d'authentification
  - Codes d'erreur
  - Exemples d'utilisation
  - Métriques de performance

### 🔧 Guides et Support
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

### 📋 Suivi du Projet
- [TODO List](./TODO.md)
  - Priorités actuelles
  - Tâches en cours
  - Fonctionnalités complétées

### 📅 Versions
- [Changelog](./CHANGELOG.md)
  - Historique des versions
  - Nouvelles fonctionnalités
  - Corrections de bugs

## 🚀 Démarrage Rapide

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

## 🔑 Comptes de Test

### Admin
- Email: admin@test.com
- Mot de passe: Admin123!

### Pâtissier
- Email: patissier@test.com
- Mot de passe: Patissier123!

### Utilisateur Standard
- Email: user@test.com
- Mot de passe: User123!

## 📁 Structure du Projet

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

## 🔄 Workflow de Développement

1. Créer une branche pour la fonctionnalité
2. Développer et tester localement
3. Exécuter les tests
4. Créer une Pull Request
5. Review du code
6. Merge après validation

## 🐛 Signalement de Bugs

1. Vérifier les logs
2. Consulter la documentation
3. Créer une issue détaillée
4. Ajouter les labels appropriés

## 📞 Support

Pour toute question ou assistance :
1. Consulter la documentation
2. Vérifier les issues existantes
3. Créer une nouvelle issue si nécessaire 