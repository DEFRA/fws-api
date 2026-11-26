module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.js'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/test/data/', '<rootDir>/test/helpers/schemas.js'],
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverageFrom: ['lib/**/*.js'],
  coverageThreshold: {
    global: { statements: 90, branches: 90, functions: 90, lines: 90 }
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcovonly']
}
