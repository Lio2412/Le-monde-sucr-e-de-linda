# 🌐 Documentation API

## Authentification

### POST /api/auth/login

Authentification d'un utilisateur.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response Success: (200)**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "ADMIN" | "PATISSIER" | "USER",
    "name": "string"
  }
}
```

**Response Error: (401)**
```json
{
  "error": "Email ou mot de passe incorrect"
}
```

**Taille moyenne de réponse:** 1266 bytes
**Temps de réponse moyen:** ~51ms

### POST /api/auth/register

Création d'un nouveau compte utilisateur.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response Success: (200)**
```json
{
  "message": "Compte créé avec succès"
}
```

**Response Error: (400)**
```json
{
  "error": "Cet email est déjà utilisé"
}
```

**Taille moyenne de réponse:** 59 bytes
**Temps de réponse moyen:** ~2ms

### GET /api/auth/me

Récupération des informations de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success: (200)**
```json
{
  "id": "string",
  "email": "string",
  "role": "ADMIN" | "PATISSIER" | "USER",
  "name": "string"
}
```

**Response Error: (401)**
```json
{
  "error": "Non autorisé"
}
```

**Taille moyenne de réponse:** 1054 bytes
**Temps de réponse moyen:** ~3ms

## Gestion du Cache

- Les réponses utilisent le cache HTTP (304 Not Modified)
- Le cache client est validé à chaque requête
- Les réponses incluent les headers ETag appropriés

## Gestion des Erreurs

### Format des Erreurs
```json
{
  "error": "Message d'erreur"
}
```

### Codes d'Erreur
- `400` - Requête invalide (validation, données manquantes)
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Ressource non trouvée
- `500` - Erreur serveur

## Exemples d'Utilisation

### Connexion avec Fetch
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
```

### Récupération du Profil avec Axios
```typescript
const getProfile = async (token: string) => {
  try {
    const response = await axios.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error || 'Erreur inconnue');
    }
    throw error;
  }
};
```

## Sécurité

- Rate limiting: 100 requêtes par IP par 15 minutes
- Validation des données avec Zod
- Protection CSRF
- Headers de sécurité (CORS, CSP, etc.)
- Tokens JWT avec expiration de 24h 