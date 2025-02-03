/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setup/backend.jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../backend/src/$1',
    '^@/tests/(.*)$': '<rootDir>/../$1',
  },
  testMatch: [
    '<rootDir>/../unit/backend/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/../api/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/../../backend/tsconfig.json',
      useESM: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/../../backend/coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  collectCoverageFrom: [
    '<rootDir>/../../backend/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/../../backend/src/**/*.d.ts',
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../backend/tsconfig.json',
      useESM: true,
    },
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  verbose: true,
  testTimeout: 30000,
};
