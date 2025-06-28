/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // preset: 'ts-jest/presets/default-esm', // Avoid preset for now
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'], // Important for ESM
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true, // Tell ts-jest to output ESM
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    // This is important for ts-jest in ESM mode to correctly map .js imports to .ts files
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
