# 🔧 Guide de Dépannage

## Erreurs Courantes

### 1. Erreurs d'Authentification

#### "Email ou mot de passe incorrect"
- **Symptôme:** Erreur 401 lors de la connexion
- **Cause:** Identifiants invalides
- **Solution:** 
  - Vérifier l'email et le mot de passe
  - Vérifier que le compte existe
  - Utiliser la fonction "Mot de passe oublié" si nécessaire

#### "Cet email est déjà utilisé"
- **Symptôme:** Erreur 400 lors de l'inscription
- **Cause:** Email déjà enregistré dans la base de données
- **Solution:**
  - Utiliser un autre email
  - Se connecter avec l'email existant
  - Utiliser la récupération de mot de passe si nécessaire

### 2. Erreurs d'Import

#### "authService is not exported from '@/services/authService'"
- **Symptôme:** Erreur de compilation dans le frontend
- **Cause:** Problème d'export/import du service d'authentification
- **Solution:**
  ```typescript
  // Dans authService.ts
  export const authService = {
    login,
    register,
    logout,
    // ...
  };

  // Dans useAuth.ts
  import { authService } from '@/services/authService';
  ```

### 3. Erreurs de Performance

#### Temps de réponse lents
- **Symptôme:** Réponse API > 100ms
- **Cause possible:** 
  - Surcharge serveur
  - Problème de cache
  - Connexion réseau lente
- **Solution:**
  - Vérifier les logs serveur
  - Vérifier la connexion réseau
  - Utiliser le cache quand possible

#### Problèmes de Cache
- **Symptôme:** Données obsolètes ou non mises à jour
- **Cause:** Cache HTTP mal configuré
- **Solution:**
  - Vérifier les headers de cache
  - Forcer le rafraîchissement si nécessaire
  - Utiliser les ETags correctement

## Logs et Debugging

### Backend (Node.js/Express)

#### Format des Logs
```
METHOD /path STATUS TIME_MS - SIZE_BYTES
```

Exemple:
```
POST /api/auth/login 200 51.602 ms - 1266
GET /api/auth/me 304 2.561 ms - -
```

#### Codes Status Communs
- `200`: Succès
- `304`: Non modifié (cache valide)
- `400`: Erreur de requête
- `401`: Non authentifié
- `403`: Non autorisé
- `404`: Non trouvé
- `500`: Erreur serveur

### Frontend (Next.js)

#### Commandes Utiles
```bash
# Démarrer en mode développement
npm run dev

# Démarrer avec debug
npm run dev -- --debug

# Nettoyer le cache
npm run dev -- --clear
```

#### Logs de Compilation
- ✓ Succès: `Compiled successfully`
- ⚠ Avertissement: `Fast Refresh had to perform a full reload`
- ✕ Erreur: `Failed to compile`

## Outils de Debugging

### Backend
```bash
# Voir les logs en temps réel
cd backend && npm run dev

# Avec plus de détails
DEBUG=* npm run dev
```

### Frontend
```bash
# Voir les logs en temps réel
cd frontend && npm run dev

# Avec source maps
NODE_OPTIONS='--inspect' npm run dev
```

## Contact Support

Si vous ne pouvez pas résoudre un problème :

1. **Documentation**
   - Consulter ce guide
   - Vérifier la [documentation API](./API.md)
   - Lire les [notes de version](./CHANGELOG.md)

2. **Logs**
   - Collecter les logs pertinents
   - Noter les messages d'erreur exacts
   - Capturer le contexte (URL, action, etc.)

3. **Rapport**
   - Créer une issue GitHub
   - Inclure tous les détails collectés
   - Mentionner les étapes de reproduction

4. **Contact**
   - Email: support@lemondesucre.fr
   - Discord: [Serveur Support](https://discord.gg/lemondesucre)
   - GitHub: [Issues](https://github.com/lemondesucre/issues) 