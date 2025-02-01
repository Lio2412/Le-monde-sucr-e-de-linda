describe('Tests E2E Authentification', () => {
  beforeEach(() => {
    // Réinitialisation du localStorage avant chaque test
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Flux de Connexion', () => {
    it('devrait permettre à un utilisateur de se connecter avec succès', () => {
      cy.visit('/connexion');

      // Vérification des éléments du formulaire
      cy.get('[data-testid=email]').should('be.visible');
      cy.get('[data-testid=password]').should('be.visible');
      cy.get('[data-testid=submit]').should('be.visible');

      // Remplissage du formulaire
      cy.get('[data-testid=email]').type('test@test.com');
      cy.get('[data-testid=password]').type('Password123!');

      // Soumission du formulaire
      cy.get('[data-testid=submit]').click();

      // Vérification de la redirection
      cy.url().should('include', '/dashboard');

      // Vérification de la persistance de la session
      cy.window().its('localStorage.token').should('exist');
    });

    it('devrait afficher un message d\'erreur pour des identifiants invalides', () => {
      cy.visit('/connexion');

      // Tentative avec des identifiants incorrects
      cy.get('[data-testid=email]').type('wrong@test.com');
      cy.get('[data-testid=password]').type('WrongPassword123!');
      cy.get('[data-testid=submit]').click();

      // Vérification du message d'erreur
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Email ou mot de passe incorrect');

      // Vérification qu'on reste sur la page de connexion
      cy.url().should('include', '/connexion');
    });

    it('devrait valider les champs du formulaire', () => {
      cy.visit('/connexion');

      // Test avec un email invalide
      cy.get('[data-testid=email]').type('invalidemail');
      cy.get('[data-testid=submit]').click();
      cy.get('[data-testid=email-error]').should('be.visible');

      // Test avec un mot de passe trop court
      cy.get('[data-testid=email]').clear().type('test@test.com');
      cy.get('[data-testid=password]').type('short');
      cy.get('[data-testid=submit]').click();
      cy.get('[data-testid=password-error]').should('be.visible');
    });
  });

  describe('Flux d\'Inscription', () => {
    it('devrait permettre à un utilisateur de s\'inscrire', () => {
      cy.visit('/inscription');

      // Génération d'un email unique
      const uniqueEmail = `test${Date.now()}@test.com`;

      // Remplissage du formulaire d'inscription
      cy.get('[data-testid=email]').type(uniqueEmail);
      cy.get('[data-testid=password]').type('Password123!');
      cy.get('[data-testid=confirmPassword]').type('Password123!');
      cy.get('[data-testid=nom]').type('Test');
      cy.get('[data-testid=prenom]').type('User');
      cy.get('[data-testid=pseudo]').type('testuser');

      // Soumission du formulaire
      cy.get('[data-testid=submit]').click();

      // Vérification de la redirection
      cy.url().should('include', '/dashboard');

      // Vérification de la session
      cy.window().its('localStorage.token').should('exist');
    });

    it('devrait empêcher l\'inscription avec un email existant', () => {
      cy.visit('/inscription');

      // Utilisation d'un email déjà enregistré
      cy.get('[data-testid=email]').type('test@test.com');
      cy.get('[data-testid=password]').type('Password123!');
      cy.get('[data-testid=confirmPassword]').type('Password123!');
      cy.get('[data-testid=nom]').type('Test');
      cy.get('[data-testid=prenom]').type('User');
      cy.get('[data-testid=pseudo]').type('testuser');

      cy.get('[data-testid=submit]').click();

      // Vérification du message d'erreur
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Cet email est déjà utilisé');
    });
  });

  describe('Protection des Routes', () => {
    it('devrait rediriger vers la connexion pour les routes protégées', () => {
      // Tentative d'accès à une route protégée sans authentification
      cy.visit('/dashboard');

      // Vérification de la redirection
      cy.url().should('include', '/connexion');
    });

    it('devrait maintenir la session après rafraîchissement', () => {
      // Connexion
      cy.visit('/connexion');
      cy.get('[data-testid=email]').type('test@test.com');
      cy.get('[data-testid=password]').type('Password123!');
      cy.get('[data-testid=submit]').click();

      // Attente de la redirection
      cy.url().should('include', '/dashboard');

      // Rafraîchissement de la page
      cy.reload();

      // Vérification qu'on reste sur le dashboard
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Déconnexion', () => {
    it('devrait permettre à l\'utilisateur de se déconnecter', () => {
      // Connexion
      cy.visit('/connexion');
      cy.get('[data-testid=email]').type('test@test.com');
      cy.get('[data-testid=password]').type('Password123!');
      cy.get('[data-testid=submit]').click();

      // Vérification de la connexion
      cy.url().should('include', '/dashboard');

      // Déconnexion
      cy.get('[data-testid=logout-button]').click();

      // Vérification de la redirection
      cy.url().should('include', '/connexion');

      // Vérification de la suppression du token
      cy.window().its('localStorage.token').should('not.exist');
    });
  });

  describe('Gestion des Rôles', () => {
    it('devrait gérer l\'accès aux routes selon les rôles', () => {
      // Connexion en tant qu'utilisateur standard
      cy.visit('/connexion');
      cy.get('[data-testid=email]').type('user@test.com');
      cy.get('[data-testid=password]').type('User123!');
      cy.get('[data-testid=submit]').click();

      // Tentative d'accès à une route admin
      cy.visit('/admin');

      // Vérification de la redirection vers la page d'accès refusé
      cy.url().should('include', '/acces-refuse');

      // Déconnexion
      cy.get('[data-testid=logout-button]').click();

      // Connexion en tant qu'admin
      cy.get('[data-testid=email]').type('admin@test.com');
      cy.get('[data-testid=password]').type('Admin123!');
      cy.get('[data-testid=submit]').click();

      // Tentative d'accès à la route admin
      cy.visit('/admin');

      // Vérification de l'accès
      cy.url().should('include', '/admin');
    });
  });

  describe('Performance et UX', () => {
    it('devrait afficher un indicateur de chargement pendant l\'authentification', () => {
      cy.visit('/connexion');

      // Remplissage et soumission du formulaire
      cy.get('[data-testid=email]').type('test@test.com');
      cy.get('[data-testid=password]').type('Password123!');
      cy.get('[data-testid=submit]').click();

      // Vérification de l'indicateur de chargement
      cy.get('[data-testid=loading-spinner]').should('be.visible');

      // Vérification de la disparition de l'indicateur après chargement
      cy.get('[data-testid=loading-spinner]').should('not.exist');
    });

    it('devrait désactiver le formulaire pendant la soumission', () => {
      cy.visit('/connexion');

      // Remplissage du formulaire
      cy.get('[data-testid=email]').type('test@test.com');
      cy.get('[data-testid=password]').type('Password123!');
      cy.get('[data-testid=submit]').click();

      // Vérification que les champs sont désactivés
      cy.get('[data-testid=email]').should('be.disabled');
      cy.get('[data-testid=password]').should('be.disabled');
      cy.get('[data-testid=submit]').should('be.disabled');
    });
  });
}); 