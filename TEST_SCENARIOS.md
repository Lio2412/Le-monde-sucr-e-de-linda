# Scénarios de Test - Système d'Authentification

## Utilisateurs de Test

### 1. Administrateur
- Email: admin@test.com
- Mot de passe: Admin123!
- Rôles: admin, user

### 2. Utilisateur Standard
- Email: user@test.com
- Mot de passe: User123!
- Rôles: user

### 3. Pâtissier
- Email: patissier@test.com
- Mot de passe: Patissier123!
- Rôles: patissier, user

## Scénarios de Test

### 1. Connexion

#### 1.1 Connexion Réussie
1. Accéder à la page de connexion
2. Entrer les identifiants de l'administrateur
3. Vérifier :
   - Redirection vers le tableau de bord
   - Affichage du nom de l'utilisateur
   - Accès aux fonctionnalités d'administration

#### 1.2 Connexion Échouée
1. Accéder à la page de connexion
2. Entrer des identifiants incorrects
3. Vérifier :
   - Message d'erreur approprié
   - Pas de redirection
   - Possibilité de réessayer

### 2. Protection des Routes

#### 2.1 Accès Non Authentifié
1. Se déconnecter
2. Essayer d'accéder directement aux URLs protégées :
   - /dashboard
   - /admin
   - /recettes/creer
3. Vérifier :
   - Redirection vers la page de connexion
   - Message approprié

#### 2.2 Accès avec Rôles Insuffisants
1. Se connecter en tant qu'utilisateur standard
2. Essayer d'accéder aux pages réservées aux administrateurs
3. Vérifier :
   - Redirection vers la page d'accès refusé
   - Message approprié

### 3. Gestion de Session

#### 3.1 Persistance de Session
1. Se connecter
2. Rafraîchir la page
3. Vérifier :
   - Session maintenue
   - Pas de déconnexion

#### 3.2 Expiration de Session
1. Se connecter
2. Attendre l'expiration du token
3. Vérifier :
   - Déconnexion automatique
   - Redirection vers la page de connexion

### 4. Déconnexion

#### 4.1 Déconnexion Manuelle
1. Se connecter
2. Cliquer sur le bouton de déconnexion
3. Vérifier :
   - Redirection vers la page de connexion
   - Suppression du token
   - Impossibilité d'accéder aux routes protégées

### 5. Gestion des Rôles

#### 5.1 Accès Administrateur
1. Se connecter en tant qu'administrateur
2. Vérifier l'accès à :
   - Panel d'administration
   - Gestion des utilisateurs
   - Gestion des rôles

#### 5.2 Accès Pâtissier
1. Se connecter en tant que pâtissier
2. Vérifier l'accès à :
   - Création de recettes
   - Modification de ses propres recettes
   - Impossibilité d'accéder au panel d'administration

#### 5.3 Accès Utilisateur Standard
1. Se connecter en tant qu'utilisateur standard
2. Vérifier :
   - Accès au profil personnel
   - Accès aux recettes publiques
   - Impossibilité de créer des recettes
   - Impossibilité d'accéder aux fonctionnalités administratives

## Instructions pour les Tests

1. Exécuter chaque scénario dans l'ordre
2. Noter tout comportement inattendu
3. Vérifier les messages d'erreur et leur pertinence
4. Tester sur différents navigateurs
5. Vérifier la réactivité sur mobile

## Résultats Attendus

- Tous les scénarios doivent passer avec succès
- Les messages d'erreur doivent être clairs et en français
- Les redirections doivent être fluides
- L'expérience utilisateur doit être cohérente 