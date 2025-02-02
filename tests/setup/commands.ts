// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

// -- This is a parent command --
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth/signin')
    cy.get('[data-cy=email-input]').type(email)
    cy.get('[data-cy=password-input]').type(password)
    cy.get('[data-cy=submit-button]').click()
    cy.url().should('not.include', '/auth/signin')
  })
})

// -- This is a child command --
Cypress.Commands.add('getByTestId', { prevSubject: 'optional' }, (subject: any, selector: string) => {
  if (subject) {
    return cy.wrap(subject).find(`[data-cy=${selector}]`)
  }
  return cy.get(`[data-cy=${selector}]`)
})

// -- This is a dual command --
Cypress.Commands.add('waitForApi', { prevSubject: 'optional' }, (subject: any, method: string, url: string) => {
  if (subject) {
    cy.wrap(subject)
  }
  cy.intercept(method, url).as('apiCall')
  cy.wait('@apiCall')
})

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      getByTestId(selector: string): Chainable<JQuery<HTMLElement>>
      waitForApi(method: string, url: string): Chainable<void>
    }
  }
}

export {}; 