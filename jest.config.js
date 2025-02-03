const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './frontend',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/frontend/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/frontend/src/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/frontend/src/services/$1',
    '^@/lib/(.*)$': '<rootDir>/frontend/src/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/frontend/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/frontend/src/types/$1',
    '^@/contexts/(.*)$': '<rootDir>/frontend/src/contexts/$1',
    '^@/middleware/(.*)$': '<rootDir>/frontend/src/middleware/$1',
    '^@/pages/(.*)$': '<rootDir>/frontend/src/pages/$1'
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/frontend/.next/',
    '<rootDir>/frontend/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/cypress/'
  ],
  modulePaths: ['<rootDir>/frontend/src'],
  roots: ['<rootDir>'],
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{ts,tsx}'
  ],
  collectCoverageFrom: [
    'frontend/src/**/*.{js,jsx,ts,tsx}',
    '!frontend/src/**/*.d.ts',
    '!frontend/src/**/*.stories.{js,jsx,ts,tsx}',
    '!frontend/src/**/_app.{js,jsx,ts,tsx}',
    '!frontend/src/**/_document.{js,jsx,ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};

module.exports = createJestConfig(customJestConfig);
