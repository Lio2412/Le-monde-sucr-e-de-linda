# 🌐 Documentation API

## 🔄 Points de Terminaison

### 🔑 Authentification

#### POST /api/auth/login
Authentification d'un utilisateur.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "USER",
    "name": "string"
  }
}
```

#### POST /api/auth/register
Création d'un compte utilisateur.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "email": "string",
  "name": "string"
}
```

### 🍰 Recettes

#### GET /api/recipes
Liste des recettes avec pagination et filtres.

**Query Parameters:**
- `page`: number (défaut: 1)
- `limit`: number (défaut: 10)
- `search`: string
- `category`: string
- `difficulty`: "EASY" | "MEDIUM" | "HARD"

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "difficulty": "string",
      "preparationTime": number,
      "image": "string"
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

#### GET /api/recipes/:id
Détails d'une recette.

**Response (200 OK):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": number,
      "unit": "string"
    }
  ],
  "steps": [
    {
      "order": number,
      "description": "string"
    }
  ],
  "difficulty": "string",
  "preparationTime": number,
  "image": "string",
  "author": {
    "id": "string",
    "name": "string"
  }
}
```

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
- Temps de réponse moyen : < 100ms
- Taux de succès : 99.9%
- Cache hit rate : 95%

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