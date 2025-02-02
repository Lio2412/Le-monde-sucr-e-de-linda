const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: '../e2e/**/*.cy.{js,ts}',
    supportFile: 'cypress/support/index.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    setupNodeEvents(on, config) {
      // Configurer les événements Node ici
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
      });
    },
  },
  env: {
    apiUrl: 'http://localhost:5000/api',
    coverage: false,
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
}); 