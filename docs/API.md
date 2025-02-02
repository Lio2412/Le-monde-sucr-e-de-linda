# 🚀 Documentation API
Mise à jour : 02/02/2024

## 🔄 Points de Terminaison

### 🔑 Authentification

#### POST /api/auth/login
- **Temps de réponse** : ~37ms ✅
- **Rate Limit** : 100 requêtes/15min
- **Cache** : Non
```typescript
// Request
{
  "email": string,
  "password": string
}

// Response 200
{
  "token": string,
  "user": {
    "id": string,
    "email": string,
    "role": "USER" | "ADMIN" | "PATISSIER"
  }
}
```

#### POST /api/auth/register
- **Temps de réponse** : ~12ms ✅
- **Rate Limit** : 10 requêtes/heure
- **Cache** : Non
```typescript
// Request
{
  "email": string,
  "password": string,
  "nom": string,
  "prenom": string
}
```

### 🍰 Recettes

#### GET /api/recipes
- **Temps de réponse** : ~50ms
- **Cache** : 15 minutes
- **Pagination** : Oui
- **Filtres** : catégorie, difficulté, temps

#### GET /api/recipes/:id
- **Temps de réponse** : ~30ms
- **Cache** : 1 heure
- **Compression** : gzip

### 💖 Favoris

#### POST /api/favorites
Ajouter une recette aux favoris.

**Request Body:**
```json
{
  "recipeId": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "recipeId": "string",
  "userId": "string"
}
```

#### DELETE /api/favorites/:recipeId
Retirer une recette des favoris.

**Response (204 No Content)**

### 🔍 Recherche

#### GET /api/search/suggestions
Suggestions de recherche.

**Query Parameters:**
- `q`: string (terme de recherche)

**Response (200 OK):**
```json
{
  "suggestions": [
    {
      "id": "string",
      "title": "string",
      "type": "RECIPE" | "CATEGORY"
    }
  ]
}
```

## 📊 Métriques

### Performance
- Temps de réponse moyen : < 50ms
- Taux de succès : 99.9%
- Disponibilité : 99.99%

### Cache
- Hit rate : 95%
- Stratégie : stale-while-revalidate
- Purge : automatique

### Limites
- Rate limit : 100 requêtes/minute
- Taille max des payloads : 1MB
- Limite de pagination : 50 items/page

## 🔒 Sécurité

### Authentication
- JWT (JSON Web Tokens)
- Expiration : 24h
- Rate limiting sur /login et /register

### Headers Requis
```
Authorization: Bearer <token>
Content-Type: application/json
```

## 🚨 Gestion des Erreurs

### Format Standard
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### Codes d'Erreur
- 400: Requête invalide
- 401: Non authentifié
- 403: Non autorisé
- 404: Ressource non trouvée
- 429: Trop de requêtes
- 500: Erreur serveur

## 📝 Versions

### v1.0.0 (Current)
- API REST complète
- Authentication JWT
- CRUD Recettes
- Gestion des favoris
- Recherche avec suggestions

### v1.1.0 (Planned)
- GraphQL endpoint
- Real-time notifications
- Social sharing
- Image optimization
- Analytics

## 📊 Performances Globales

### Métriques
- Temps de réponse moyen : < 50ms
- Taux de succès : 99.9%
- Disponibilité : 99.99%

### Cache
- Hit rate : 95%
- Stratégie : stale-while-revalidate
- Purge : automatique

### Sécurité
- Rate Limiting : ✅
- CORS configuré : ✅
- Headers sécurisés : ✅
- Validation des données : ✅

## 🔍 Monitoring

### Alertes
- Temps de réponse > 500ms
- Erreur 5xx > 0.1%
- Cache miss > 10%

### Logs
- Format : JSON structuré
- Rétention : 30 jours
- Niveau : INFO en prod

## 👤 Utilisateurs

### GET /api/users
- **Temps de réponse** : ~45ms
- **Cache** : 2 minutes
- **Pagination** : ?page=1&limit=10
- **Rôle requis** : ADMIN

### PATCH /api/users/:id/role
- **Temps de réponse** : ~25ms
- **Cache** : Non
- **Rôle requis** : ADMIN
```typescript
// Request
{
  "role": "USER" | "ADMIN" | "PATISSIER"
}
```

### GET /api/me
- **Temps de réponse** : ~9ms ✅
- **Cache** : 5 minutes
- **Headers requis** : `Authorization: Bearer <token>`