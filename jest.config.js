/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  globals: {
    'ts-jest': { tsconfig: 'tsconfig.test.json' },
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  coverageThreshold: { global: { lines: 65 } },
  clearMocks: true,
};
