/** @type {import('jest').Config} */
const config = {
  displayName: 'frontend',
  rootDir: '../../frontend',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/../tests/setup/frontend.jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      useESM: true,
      babelConfig: true
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/../tests/mocks/fileMock.js'
  },
  testMatch: [
    '<rootDir>/../tests/unit/frontend/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/../tests/integration/**/*.test.{js,jsx,ts,tsx}'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(next|@radix-ui|@hookform|@tanstack|sonner)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/types/**/*'
  ],
  coverageDirectory: '../coverage/frontend',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  resolver: '<rootDir>/../tests/setup/resolver.js',
  verbose: true,
  testTimeout: 10000,
  moduleDirectories: ['node_modules', '<rootDir>/src']
};

module.exports = config; 