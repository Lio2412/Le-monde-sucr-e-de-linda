describe('Page de connexion', () => {
  beforeEach(() => {
    cy.cleanupAuth();
    cy.visit('/connexion', { failOnStatusCode: false });
    cy.document().should('have.property', 'readyState').and('eq', 'complete');
    cy.get('body').should('be.visible');
  });

  it('devrait afficher le formulaire de connexion', () => {
    cy.document().should('have.property', 'readyState').and('eq', 'complete');
    cy.get('body').should('be.visible');
    cy.get('[data-testid=email]').should('be.visible');
    cy.get('[data-testid=password]').should('be.visible');
    cy.get('[data-testid=submit]').should('be.visible');
  });

  it('devrait permettre la connexion avec des identifiants valides', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@test.com',
            nom: 'Test',
            prenom: 'User',
            pseudo: 'testuser',
            roles: [{ role: { nom: 'USER' } }]
          },
          token: 'fake-jwt-token'
        }
      }
    }).as('loginRequest');

    cy.get('[data-testid=email]').type('test@test.com');
    cy.get('[data-testid=password]').type('Test123!');
    cy.get('[data-testid=submit]').click();

    cy.wait('@loginRequest', { timeout: 10000 });
    cy.url().should('include', '/dashboard');
  });

  it('devrait afficher une erreur avec des identifiants invalides', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: {
        success: false,
        message: 'Email ou mot de passe incorrect'
      }
    }).as('loginFailedRequest');

    cy.get('[data-testid=email]').type('invalid@test.com');
    cy.get('[data-testid=password]').type('wrongpassword');
    cy.get('[data-testid=submit]').click();

    cy.wait('@loginFailedRequest', { timeout: 10000 });
    cy.get('[data-testid=error-message]').should('be.visible');
    cy.url().should('include', '/connexion');
  });

  it('devrait basculer la visibilité du mot de passe', () => {
    cy.get('[data-testid=password]').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="Afficher/Masquer le mot de passe"]').click();
    cy.get('[data-testid=password]').should('have.attr', 'type', 'text');
  });

  it('devrait rediriger vers la page d\'inscription', () => {
    cy.contains('S\'inscrire').click();
    cy.url().should('include', '/inscription');
  });

  it('devrait rediriger vers la page de mot de passe oublié', () => {
    cy.contains('Mot de passe oublié').click();
    cy.url().should('include', '/mot-de-passe-oublie');
  });
}); 