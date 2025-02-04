# API Reference

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### Authentification

#### `POST /auth/register`
Inscription d'un nouvel utilisateur.
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### `POST /auth/login`
Connexion utilisateur.
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### `GET /auth/me`
Profil de l'utilisateur connecté.
> Requiert: `Authorization: Bearer <token>`

## Erreurs

### Format
```json
{
  "error": {
    "message": "Description",
    "code": "ERROR_CODE"
  }
}
```

### Codes Communs
- `AUTH_INVALID_CREDENTIALS`: Identifiants invalides
- `AUTH_TOKEN_MISSING`: Token manquant
- `AUTH_TOKEN_INVALID`: Token invalide