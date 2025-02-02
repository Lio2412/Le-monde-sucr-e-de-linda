import '@testing-library/cypress/add-commands';

// Commandes personnalisées pour l'authentification
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/connexion');
  cy.waitForPageLoad();
  cy.get('[data-testid=email]').type(email);
  cy.get('[data-testid=password]').type(password);
  cy.get('[data-testid=submit]').click();
});

// Commande pour vérifier l'authentification
Cypress.Commands.add('checkAuth', () => {
  cy.window().its('localStorage').invoke('getItem', 'token').should('exist');
});

// Commande pour la déconnexion
Cypress.Commands.add('logout', () => {
  cy.window().its('localStorage').invoke('removeItem', 'token');
  cy.visit('/connexion');
});

// Commande pour nettoyer l'état
Cypress.Commands.add('cleanupAuth', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

// Commande pour attendre le chargement complet de la page
Cypress.Commands.add('waitForPageLoad', () => {
  cy.document().should('have.property', 'readyState').and('eq', 'complete');
  cy.get('body').should('be.visible');
});

// Types pour les commandes personnalisées
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      checkAuth(): Chainable<void>;
      logout(): Chainable<void>;
      cleanupAuth(): Chainable<void>;
      waitForPageLoad(): Chainable<void>;
    }
  }
} 