module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/frontend.jest.setup.js',
    '@testing-library/jest-dom'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../frontend/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/mocks/fileMock.js',
    '^next/font/(.*)$': '<rootDir>/mocks/next/font/$1',
    '^next-router-mock$': '<rootDir>/mocks/next-router-mock.ts'
  },
  testPathIgnorePatterns: ['<rootDir>/../../frontend/node_modules/', '<rootDir>/../../frontend/.next/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  moduleDirectories: ['node_modules', '<rootDir>/../../frontend/src'],
  testMatch: [
    '<rootDir>/../unit/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/../api/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/../e2e/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
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
    '<rootDir>/../../frontend/src/**/*.{js,jsx,ts,tsx}',
    '!<rootDir>/../../frontend/src/**/*.d.ts',
    '!<rootDir>/../../frontend/src/**/*.stories.{js,jsx,ts,tsx}',
    '!<rootDir>/../../frontend/src/pages/_app.tsx',
    '!<rootDir>/../../frontend/src/pages/_document.tsx'
  ]
} 