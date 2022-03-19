module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['index.*'],
  testPathIgnorePatterns: ['/node_modules/', '/dist'],
  reporters: ['jest-progress-bar-reporter'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
