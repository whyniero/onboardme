/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/**/*.test.ts'],
  clearMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },
};
