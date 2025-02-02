/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setup/backend.jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../backend/src/$1',
  },
  testMatch: [
    '<rootDir>/../../tests/api/**/*.test.ts',
    '<rootDir>/../../tests/unit/**/*.test.ts'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/../../backend/tsconfig.json'
    }]
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  collectCoverageFrom: [
    '<rootDir>/../../backend/src/**/*.{js,ts}',
    '!<rootDir>/../../backend/src/**/*.d.ts',
    '!<rootDir>/../../backend/src/server.ts',
    '!<rootDir>/../../backend/src/config/**/*'
  ]
};
