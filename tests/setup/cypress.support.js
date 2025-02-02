// ***********************************************************
// This example support/e2e.js is processed and loaded automatically 
// before your test files.
//
// This is a great place to put global configuration and behavior 
// that modifies Cypress.
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands.ts'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
})

// Hide fetch/XHR requests from command log
if (Cypress.config('hideXHRInCommandLog')) {
  const app = window.top;
  if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
    const style = app.document.createElement('style');
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');
    app.document.head.appendChild(style);
  }
}

// Custom commands
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/auth/signin')
    cy.get('[data-cy=email-input]').type(email)
    cy.get('[data-cy=password-input]').type(password)
    cy.get('[data-cy=submit-button]').click()
    cy.url().should('not.include', '/auth/signin')
  })
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click()
  cy.get('[data-cy=logout-button]').click()
  cy.url().should('include', '/auth/signin')
})

Cypress.Commands.add('getByTestId', (selector) => {
  return cy.get(`[data-cy=${selector}]`)
})

Cypress.Commands.add('waitForApi', (method, url) => {
  cy.intercept(method, url).as('apiCall')
  cy.wait('@apiCall')
})

// Custom assertions
chai.Assertion.addMethod('containTextContent', function (expectedText) {
  const obj = this._obj
  const actualText = obj.text().replace(/\s+/g, ' ').trim()
  const normalizedExpectedText = expectedText.replace(/\s+/g, ' ').trim()
  this.assert(
    actualText === normalizedExpectedText,
    `expected #{this} to have text content "${normalizedExpectedText}" but got "${actualText}"`
  )
}) 