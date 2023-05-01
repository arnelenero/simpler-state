module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  resetMocks: false,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, isolatedModules: true }],
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/es/',
    '<rootDir>/lib/',
    '<rootDir>/types/',
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/es/',
    '<rootDir>/lib/',
    '<rootDir>/types/',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/es/',
    '<rootDir>/lib/',
    '<rootDir>/types/',
  ],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts', '!src/index.ts'],
}
