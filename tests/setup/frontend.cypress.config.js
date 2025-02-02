const { defineConfig } = require('cypress');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    supportFile: path.resolve(__dirname, './cypress.support.ts'),
    specPattern: path.resolve(__dirname, '../e2e/**/*.cy.{js,jsx,ts,tsx}'),
    screenshotsFolder: path.resolve(__dirname, '../e2e/screenshots'),
    videosFolder: path.resolve(__dirname, '../e2e/videos'),
    downloadsFolder: path.resolve(__dirname, '../e2e/downloads'),
    fixturesFolder: path.resolve(__dirname, '../e2e/fixtures'),
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 30000,
    pageLoadTimeout: 30000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    retries: {
      runMode: 2,
      openMode: 0
    },
    setupNodeEvents(on, config) {
      // Définir les variables d'environnement directement
      config.env = {
        ...config.env,
        NODE_ENV: 'test',
        NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3001',
        NEXT_PUBLIC_ENVIRONMENT: 'test',
        NEXT_PUBLIC_MOCK_AUTH: 'true'
      };
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: path.resolve(__dirname, '../unit/components/**/*.cy.{js,jsx,ts,tsx}'),
    supportFile: path.resolve(__dirname, './cypress.support.ts')
  }
}); 